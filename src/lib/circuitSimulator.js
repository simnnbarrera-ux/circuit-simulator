/**
 * Motor de simulación de circuitos eléctricos
 * Implementa Análisis Nodal Modificado (MNA) para resolver circuitos
 */

/**
 * Clase principal del simulador de circuitos
 */
export class CircuitSimulator {
  constructor(components, connections) {
    this.components = components;
    this.connections = connections || [];
    this.nodeMap = new Map(); // Mapeo de componentes a nodos
    this.numNodes = 0;
    this.results = null;
  }

  /**
   * Ejecuta la simulación del circuito
   */
  simulate() {
    try {
      console.log('=== INICIANDO SIMULACIÓN ===');
      console.log('Componentes:', this.components);
      console.log('Conexiones:', this.connections);

      // Validar que hay componentes
      if (!this.components || this.components.length === 0) {
        throw new Error('No hay componentes en el circuito');
      }

      // Validar que hay al menos un nodo de tierra
      const hasGround = this.components.some(c => c.type === 'ground');
      if (!hasGround) {
        throw new Error('El circuito debe tener al menos un nodo de tierra');
      }

      // Identificar nodos
      this.identifyNodes();
      console.log('Nodos identificados:', this.numNodes);
      console.log('Mapa de nodos:', this.nodeMap);

      // Construir sistema de ecuaciones
      const { G, I } = this.buildSystem();
      console.log('Matriz G:', G);
      console.log('Vector I:', I);

      // Resolver sistema
      const voltages = this.solveSystem(G, I);
      console.log('Voltajes calculados:', voltages);

      // Calcular corrientes y potencias
      this.results = this.calculateResults(voltages);
      console.log('Resultados finales:', this.results);

      return {
        success: true,
        results: this.results,
        message: 'Simulación completada exitosamente'
      };
    } catch (error) {
      console.error('Error en simulación:', error);
      return {
        success: false,
        error: error.message,
        message: 'Error en la simulación'
      };
    }
  }

  /**
   * Identificar nodos del circuito basándose en conexiones
   */
  identifyNodes() {
    // Resetear
    this.nodeMap.clear();
    let nodeCounter = 0;

    // Asignar nodo 0 a todas las tierras
    this.components.forEach(comp => {
      if (comp.type === 'ground') {
        this.nodeMap.set(`${comp.id}-0`, 0);
        this.nodeMap.set(`${comp.id}-1`, 0);
      }
    });

    // Procesar conexiones para asignar nodos
    this.connections.forEach(conn => {
      const fromKey = `${conn.from.componentId}-${conn.from.terminal}`;
      const toKey = `${conn.to.componentId}-${conn.to.terminal}`;

      let fromNode = this.nodeMap.get(fromKey);
      let toNode = this.nodeMap.get(toKey);

      if (fromNode === undefined && toNode === undefined) {
        // Ambos son nuevos, crear nuevo nodo
        nodeCounter++;
        this.nodeMap.set(fromKey, nodeCounter);
        this.nodeMap.set(toKey, nodeCounter);
      } else if (fromNode !== undefined && toNode === undefined) {
        // From existe, asignar mismo nodo a to
        this.nodeMap.set(toKey, fromNode);
      } else if (fromNode === undefined && toNode !== undefined) {
        // To existe, asignar mismo nodo a from
        this.nodeMap.set(fromKey, toNode);
      } else if (fromNode !== toNode) {
        // Ambos existen pero son diferentes, unificar
        const minNode = Math.min(fromNode, toNode);
        const maxNode = Math.max(fromNode, toNode);
        // Reemplazar todas las referencias al nodo mayor
        for (const [key, node] of this.nodeMap.entries()) {
          if (node === maxNode) {
            this.nodeMap.set(key, minNode);
          }
        }
      }
    });

    // Asignar nodos a terminales no conectados
    this.components.forEach(comp => {
      if (comp.type !== 'ground') {
        for (let terminal = 0; terminal <= 1; terminal++) {
          const key = `${comp.id}-${terminal}`;
          if (!this.nodeMap.has(key)) {
            nodeCounter++;
            this.nodeMap.set(key, nodeCounter);
          }
        }
      }
    });

    this.numNodes = nodeCounter + 1; // +1 para incluir el nodo 0
  }

  /**
   * Obtener nodo de un terminal de componente
   */
  getNode(componentId, terminal) {
    const key = `${componentId}-${terminal}`;
    return this.nodeMap.get(key) || 0;
  }

  /**
   * Construir sistema de ecuaciones G·V = I
   */
  buildSystem() {
    const n = this.numNodes;
    
    // Inicializar matriz G (conductancias) y vector I (corrientes)
    const G = Array(n).fill(0).map(() => Array(n).fill(0));
    const I = Array(n).fill(0);

    // Procesar cada componente
    this.components.forEach(comp => {
      const node1 = this.getNode(comp.id, 0);
      const node2 = this.getNode(comp.id, 1);

      console.log(`Procesando ${comp.type} (${comp.id}): nodo ${node1} -> nodo ${node2}`);

      switch (comp.type) {
        case 'voltage_source':
          // Fuente de voltaje: V2 - V1 = V
          // Usar método de superposición: agregar corriente equivalente
          // I = V / R_pequeña (simulamos con resistencia muy pequeña)
          const Req = 0.001; // 1mΩ
          const Geq = 1 / Req;
          const Ieq = comp.value / Req;

          if (node1 !== 0) {
            G[node1][node1] += Geq;
            I[node1] -= Ieq;
            if (node2 !== 0) {
              G[node1][node2] -= Geq;
            }
          }
          if (node2 !== 0) {
            G[node2][node2] += Geq;
            I[node2] += Ieq;
            if (node1 !== 0) {
              G[node2][node1] -= Geq;
            }
          }
          break;

        case 'current_source':
          // Fuente de corriente: inyecta corriente en los nodos
          if (node1 !== 0) {
            I[node1] -= comp.value;
          }
          if (node2 !== 0) {
            I[node2] += comp.value;
          }
          break;

        case 'resistor':
          // Resistencia: G = 1/R
          const conductance = 1 / comp.value;
          if (node1 !== 0) {
            G[node1][node1] += conductance;
            if (node2 !== 0) {
              G[node1][node2] -= conductance;
            }
          }
          if (node2 !== 0) {
            G[node2][node2] += conductance;
            if (node1 !== 0) {
              G[node2][node1] -= conductance;
            }
          }
          break;

        case 'capacitor':
          // Para análisis DC, capacitor es circuito abierto (conductancia = 0)
          // No agregamos nada a la matriz
          break;

        case 'inductor':
          // Para análisis DC, inductor es cortocircuito (conductancia = infinito)
          // Simulamos con resistencia muy pequeña
          const Gind = 1 / 0.001;
          if (node1 !== 0) {
            G[node1][node1] += Gind;
            if (node2 !== 0) {
              G[node1][node2] -= Gind;
            }
          }
          if (node2 !== 0) {
            G[node2][node2] += Gind;
            if (node1 !== 0) {
              G[node2][node1] -= Gind;
            }
          }
          break;

        case 'led':
          // LED simplificado: resistencia + voltaje de umbral
          // Para simplificar, usamos solo resistencia
          const Rled = 100; // 100Ω
          const Gled = 1 / Rled;
          if (node1 !== 0) {
            G[node1][node1] += Gled;
            if (node2 !== 0) {
              G[node1][node2] -= Gled;
            }
          }
          if (node2 !== 0) {
            G[node2][node2] += Gled;
            if (node1 !== 0) {
              G[node2][node1] -= Gled;
            }
          }
          break;

        case 'ground':
          // Tierra ya está manejada (nodo 0)
          break;
      }
    });

    // Fijar nodo 0 (tierra) a 0V
    G[0] = Array(n).fill(0);
    G[0][0] = 1;
    I[0] = 0;

    return { G, I };
  }

  /**
   * Resolver sistema lineal G·V = I usando eliminación gaussiana
   */
  solveSystem(G, I) {
    const n = G.length;
    
    // Crear copia para no modificar originales
    const A = G.map(row => [...row]);
    const b = [...I];

    // Eliminación gaussiana con pivoteo parcial
    for (let k = 0; k < n; k++) {
      // Buscar pivote
      let maxRow = k;
      for (let i = k + 1; i < n; i++) {
        if (Math.abs(A[i][k]) > Math.abs(A[maxRow][k])) {
          maxRow = i;
        }
      }

      // Intercambiar filas
      [A[k], A[maxRow]] = [A[maxRow], A[k]];
      [b[k], b[maxRow]] = [b[maxRow], b[k]];

      // Verificar que el pivote no es cero
      if (Math.abs(A[k][k]) < 1e-10) {
        console.warn(`Pivote muy pequeño en fila ${k}`);
        continue;
      }

      // Eliminación
      for (let i = k + 1; i < n; i++) {
        const factor = A[i][k] / A[k][k];
        for (let j = k; j < n; j++) {
          A[i][j] -= factor * A[k][j];
        }
        b[i] -= factor * b[k];
      }
    }

    // Sustitución hacia atrás
    const x = Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
      let sum = 0;
      for (let j = i + 1; j < n; j++) {
        sum += A[i][j] * x[j];
      }
      x[i] = (b[i] - sum) / A[i][i];
      
      // Manejar NaN o Infinity
      if (!isFinite(x[i])) {
        x[i] = 0;
      }
    }

    return x;
  }

  /**
   * Calcular corrientes y potencias en cada componente
   */
  calculateResults(voltages) {
    const nodeVoltages = {};
    const componentData = {};

    // Guardar voltajes nodales
    for (let i = 0; i < voltages.length; i++) {
      nodeVoltages[i] = voltages[i];
    }

    // Calcular datos por componente
    this.components.forEach(comp => {
      const node1 = this.getNode(comp.id, 0);
      const node2 = this.getNode(comp.id, 1);
      const V1 = voltages[node1] || 0;
      const V2 = voltages[node2] || 0;
      const Vdrop = V2 - V1; // Voltaje a través del componente

      let current = 0;
      let power = 0;

      switch (comp.type) {
        case 'voltage_source':
          // Corriente = (V2 - V1 - Vsource) / R_equivalente
          current = (Vdrop - comp.value) / 0.001;
          power = comp.value * current;
          break;

        case 'current_source':
          current = comp.value;
          power = Vdrop * current;
          break;

        case 'resistor':
          current = Vdrop / comp.value;
          power = Vdrop * current;
          break;

        case 'capacitor':
          // DC: sin corriente
          current = 0;
          power = 0;
          break;

        case 'inductor':
          current = Vdrop / 0.001;
          power = Vdrop * current;
          break;

        case 'led':
          current = Vdrop / 100;
          power = Vdrop * current;
          break;

        case 'ground':
          current = 0;
          power = 0;
          break;
      }

      componentData[comp.id] = {
        type: comp.type,
        label: comp.label || comp.type,
        voltage: Vdrop,
        current: current,
        power: power,
        nodes: [node1, node2]
      };
    });

    return {
      nodeVoltages,
      componentData
    };
  }
}

/**
 * Función helper para simular circuito
 */
export function simulateCircuit(components, connections) {
  const simulator = new CircuitSimulator(components, connections);
  return simulator.simulate();
}
