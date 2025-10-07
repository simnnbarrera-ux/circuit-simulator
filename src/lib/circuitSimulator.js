/**
 * Motor de simulación de circuitos eléctricos
 * Implementa análisis nodal (Modified Nodal Analysis - MNA) para resolver circuitos
 */

/**
 * Clase principal del simulador de circuitos
 */
export class CircuitSimulator {
  constructor(components, connections) {
    this.components = components;
    this.connections = connections || [];
    this.nodes = new Map();
    this.results = null;
  }

  /**
   * Ejecuta la simulación del circuito
   * @returns {Object} Resultados de la simulación con voltajes y corrientes
   */
  simulate() {
    try {
      // Validar que hay componentes
      if (!this.components || this.components.length === 0) {
        throw new Error('No hay componentes en el circuito');
      }

      // Identificar nodos y conexiones
      this.identifyNodes();

      // Validar que hay al menos un nodo de tierra
      if (!this.hasGroundNode()) {
        throw new Error('El circuito debe tener al menos un nodo de tierra');
      }

      // Construir el sistema de ecuaciones usando análisis nodal
      const { A, b } = this.buildNodalEquations();

      // Resolver el sistema de ecuaciones lineales
      const solution = this.solveLinearSystem(A, b);

      // Calcular corrientes y potencias
      this.results = this.calculateResults(solution);

      return {
        success: true,
        results: this.results,
        message: 'Simulación completada exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Error en la simulación'
      };
    }
  }

  /**
   * Identifica los nodos del circuito basándose en las conexiones
   */
  identifyNodes() {
    this.nodes.clear();
    
    // Mapa de terminales a nodos
    const terminalToNode = new Map();
    let nextNodeId = 1;

    // Función auxiliar para obtener clave de terminal
    const getTerminalKey = (componentId, terminal) => `${componentId}-${terminal}`;

    // Primero, identificar todos los nodos de tierra
    this.components.forEach(component => {
      if (component.type === 'ground') {
        const terminalKey = getTerminalKey(component.id, 0);
        terminalToNode.set(terminalKey, 0);
      }
    });

    // Procesar conexiones para agrupar terminales en nodos
    this.connections.forEach(connection => {
      const fromKey = getTerminalKey(connection.from.componentId, connection.from.terminal);
      const toKey = getTerminalKey(connection.to.componentId, connection.to.terminal);

      const fromNode = terminalToNode.get(fromKey);
      const toNode = terminalToNode.get(toKey);

      if (fromNode !== undefined && toNode !== undefined) {
        // Ambos terminales ya tienen nodo, unificar al menor
        const minNode = Math.min(fromNode, toNode);
        const maxNode = Math.max(fromNode, toNode);
        
        // Reemplazar todas las referencias al nodo mayor por el menor
        if (minNode !== maxNode) {
          for (const [key, node] of terminalToNode.entries()) {
            if (node === maxNode) {
              terminalToNode.set(key, minNode);
            }
          }
        }
      } else if (fromNode !== undefined) {
        // Solo from tiene nodo, asignar el mismo a to
        terminalToNode.set(toKey, fromNode);
      } else if (toNode !== undefined) {
        // Solo to tiene nodo, asignar el mismo a from
        terminalToNode.set(fromKey, toNode);
      } else {
        // Ninguno tiene nodo, crear uno nuevo
        terminalToNode.set(fromKey, nextNodeId);
        terminalToNode.set(toKey, nextNodeId);
        nextNodeId++;
      }
    });

    // Asignar nodos a los componentes
    this.components.forEach(component => {
      if (component.type === 'ground') {
        component.node1 = 0;
        component.node2 = 0;
      } else {
        const terminal0Key = getTerminalKey(component.id, 0);
        const terminal1Key = getTerminalKey(component.id, 1);
        
        component.node1 = terminalToNode.get(terminal0Key) || nextNodeId++;
        component.node2 = terminalToNode.get(terminal1Key) || nextNodeId++;
      }
    });
  }

  /**
   * Verifica si el circuito tiene un nodo de tierra
   */
  hasGroundNode() {
    return this.components.some(c => c.type === 'ground');
  }

  /**
   * Construye las ecuaciones nodales del circuito
   * Retorna la matriz A y el vector b del sistema Ax = b
   */
  buildNodalEquations() {
    const numNodes = this.getNumberOfNodes();
    const numVoltageSources = this.getNumberOfVoltageSources();
    const size = numNodes + numVoltageSources;

    // Inicializar matrices
    const A = Array(size).fill(0).map(() => Array(size).fill(0));
    const b = Array(size).fill(0);

    let vsIndex = numNodes; // Índice para fuentes de voltaje

    // Procesar cada componente
    this.components.forEach(component => {
      const { type, value, node1, node2 } = component;

      if (node1 === 0 && node2 === 0) return; // Ignorar tierras

      switch (type) {
        case 'resistor':
          this.addResistor(A, b, node1, node2, value);
          break;

        case 'voltage_source':
          this.addVoltageSource(A, b, node1, node2, value, vsIndex);
          component.currentIndex = vsIndex;
          vsIndex++;
          break;

        case 'current_source':
          this.addCurrentSource(A, b, node1, node2, value);
          break;

        case 'capacitor':
          // Para análisis DC, los capacitores actúan como circuito abierto
          // En análisis AC o transitorio, se requiere implementación adicional
          break;

        case 'inductor':
          // Para análisis DC, los inductores actúan como cortocircuito
          // En análisis AC o transitorio, se requiere implementación adicional
          this.addResistor(A, b, node1, node2, 0.001); // Resistencia muy pequeña
          break;

        case 'led':
          // Modelar LED como resistencia con caída de voltaje
          const ledResistance = 100; // Resistencia típica de LED
          this.addResistor(A, b, node1, node2, ledResistance);
          break;
      }
    });

    return { A, b };
  }

  /**
   * Agrega una resistencia al sistema de ecuaciones
   */
  addResistor(A, b, node1, node2, resistance) {
    if (resistance === 0) resistance = 0.001; // Evitar división por cero

    const conductance = 1 / resistance;

    if (node1 !== 0) {
      A[node1 - 1][node1 - 1] += conductance;
      if (node2 !== 0) {
        A[node1 - 1][node2 - 1] -= conductance;
      }
    }

    if (node2 !== 0) {
      A[node2 - 1][node2 - 1] += conductance;
      if (node1 !== 0) {
        A[node2 - 1][node1 - 1] -= conductance;
      }
    }
  }

  /**
   * Agrega una fuente de voltaje al sistema de ecuaciones
   */
  addVoltageSource(A, b, node1, node2, voltage, vsIndex) {
    // Ecuación de restricción de voltaje
    if (node1 !== 0) {
      A[vsIndex][node1 - 1] = 1;
      A[node1 - 1][vsIndex] = 1;
    }
    if (node2 !== 0) {
      A[vsIndex][node2 - 1] = -1;
      A[node2 - 1][vsIndex] = -1;
    }

    b[vsIndex] = voltage;
  }

  /**
   * Agrega una fuente de corriente al sistema de ecuaciones
   */
  addCurrentSource(A, b, node1, node2, current) {
    if (node1 !== 0) {
      b[node1 - 1] -= current;
    }
    if (node2 !== 0) {
      b[node2 - 1] += current;
    }
  }

  /**
   * Obtiene el número de nodos (excluyendo tierra)
   */
  getNumberOfNodes() {
    let maxNode = 0;
    this.components.forEach(component => {
      if (component.node1 > maxNode) maxNode = component.node1;
      if (component.node2 > maxNode) maxNode = component.node2;
    });
    return maxNode;
  }

  /**
   * Obtiene el número de fuentes de voltaje
   */
  getNumberOfVoltageSources() {
    return this.components.filter(c => c.type === 'voltage_source').length;
  }

  /**
   * Resuelve el sistema de ecuaciones lineales Ax = b
   * Usa eliminación gaussiana con pivoteo parcial
   */
  solveLinearSystem(A, b) {
    const n = A.length;
    const augmented = A.map((row, i) => [...row, b[i]]);

    // Eliminación gaussiana con pivoteo parcial
    for (let i = 0; i < n; i++) {
      // Buscar el pivote máximo
      let maxRow = i;
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
          maxRow = k;
        }
      }

      // Intercambiar filas
      [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];

      // Hacer ceros debajo del pivote
      for (let k = i + 1; k < n; k++) {
        const factor = augmented[k][i] / augmented[i][i];
        for (let j = i; j <= n; j++) {
          augmented[k][j] -= factor * augmented[i][j];
        }
      }
    }

    // Sustitución hacia atrás
    const solution = Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
      solution[i] = augmented[i][n];
      for (let j = i + 1; j < n; j++) {
        solution[i] -= augmented[i][j] * solution[j];
      }
      solution[i] /= augmented[i][i];
    }

    return solution;
  }

  /**
   * Calcula corrientes y potencias basándose en los voltajes nodales
   */
  calculateResults(solution) {
    const numNodes = this.getNumberOfNodes();
    const results = {
      nodeVoltages: {},
      componentData: []
    };

    // Guardar voltajes nodales
    for (let i = 0; i < numNodes; i++) {
      results.nodeVoltages[i + 1] = solution[i] || 0;
    }
    results.nodeVoltages[0] = 0; // Tierra

    // Calcular corrientes y potencias para cada componente
    this.components.forEach(component => {
      const { type, value, node1, node2, id } = component;
      const v1 = results.nodeVoltages[node1] || 0;
      const v2 = results.nodeVoltages[node2] || 0;
      const voltage = v1 - v2;

      let current = 0;
      let power = 0;

      switch (type) {
        case 'resistor':
          current = voltage / value;
          power = current * voltage;
          break;

        case 'voltage_source':
          if (component.currentIndex !== undefined) {
            current = solution[component.currentIndex] || 0;
            power = current * value;
          }
          break;

        case 'current_source':
          current = value;
          power = current * voltage;
          break;

        case 'led':
          current = voltage / 100; // Resistencia típica de LED
          power = current * voltage;
          break;

        case 'capacitor':
        case 'inductor':
          // En análisis DC, corriente es 0 para capacitores
          current = 0;
          power = 0;
          break;
      }

      results.componentData.push({
        id,
        type,
        voltage: Math.abs(voltage),
        current: Math.abs(current),
        power: Math.abs(power),
        node1Voltage: v1,
        node2Voltage: v2
      });
    });

    return results;
  }

  /**
   * Obtiene los resultados de la última simulación
   */
  getResults() {
    return this.results;
  }
}

/**
 * Función auxiliar para ejecutar una simulación rápida
 */
export function simulateCircuit(components, connections) {
  const simulator = new CircuitSimulator(components, connections);
  return simulator.simulate();
}
