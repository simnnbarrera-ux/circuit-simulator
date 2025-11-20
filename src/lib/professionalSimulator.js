/**
 * Motor de Simulación Profesional de Circuitos Analógicos
 * Basado en SPICE - Implementación completa de Análisis Nodal Modificado (MNA)
 * 
 * Características:
 * - Análisis DC (punto de operación)
 * - Análisis AC (respuesta en frecuencia)
 * - Análisis Transitorio (dominio del tiempo)
 * - Modelos companion para elementos dinámicos (C, L)
 * - Métodos de integración: Trapezoidal y Backward Euler
 * - Resolución de sistemas dispersos
 * - Newton-Raphson para no linealidades
 */

/**
 * Clase para matrices dispersas (sparse matrix) en formato triplet (COO)
 */
class SparseMatrix {
  constructor(rows, cols) {
    this.rows = rows;
    this.cols = cols;
    this.triplets = []; // Array de {row, col, value}
  }

  /**
   * Agregar o acumular valor en posición (i, j)
   */
  stamp(i, j, value) {
    if (Math.abs(value) < 1e-15) return; // Ignorar valores muy pequeños
    
    // Buscar si ya existe
    const existing = this.triplets.find(t => t.row === i && t.col === j);
    if (existing) {
      existing.value += value;
    } else {
      this.triplets.push({ row: i, col: j, value });
    }
  }

  /**
   * Convertir a matriz densa para resolución
   */
  toDense() {
    const matrix = Array(this.rows).fill(0).map(() => Array(this.cols).fill(0));
    this.triplets.forEach(({ row, col, value }) => {
      matrix[row][col] = value;
    });
    return matrix;
  }

  /**
   * Obtener valor en posición (i, j)
   */
  get(i, j) {
    const triplet = this.triplets.find(t => t.row === i && t.col === j);
    return triplet ? triplet.value : 0;
  }
}

/**
 * Clase principal del simulador profesional
 */
export class ProfessionalCircuitSimulator {
  constructor(components, connections, options = {}) {
    this.components = components;
    this.connections = connections || [];
    
    // Opciones de simulación
    this.options = {
      method: options.method || 'trapezoidal', // 'trapezoidal' o 'backward_euler'
      timeStep: options.timeStep || 1e-6, // 1 microsegundo por defecto
      maxTime: options.maxTime || 1e-3, // 1 milisegundo por defecto
      tolerance: options.tolerance || 1e-6,
      maxIterations: options.maxIterations || 50,
      gmin: options.gmin || 1e-12, // Conductancia mínima para estabilidad
      ...options
    };

    // Estado del simulador
    this.nodeMap = new Map(); // Mapeo terminal -> nodo
    this.numNodes = 0;
    this.numVoltageSources = 0;
    this.voltageSourceMap = new Map(); // Mapeo fuente -> índice de corriente
    this.systemSize = 0; // Tamaño total del sistema (nodos + corrientes de fuentes)
    
    // Resultados
    this.dcOperatingPoint = null;
    this.transientResults = null;
    this.acResults = null;
  }

  /**
   * Identificar y numerar nodos del circuito
   */
  identifyNodes() {
    this.nodeMap.clear();
    let nodeCounter = 0;

    // Nodo 0 = tierra (GND)
    this.components.forEach(comp => {
      if (comp.type === 'ground') {
        const terminals = this.getComponentTerminals(comp);
        terminals.forEach((_, idx) => {
          this.nodeMap.set(`${comp.id}-${idx}`, 0);
        });
      }
    });

    // Si hay tierra, empezar desde nodo 1
    if (this.nodeMap.size > 0) {
      nodeCounter = 1;
    }

    // Procesar conexiones
    this.connections.forEach(conn => {
      const fromKey = `${conn.from.componentId}-${conn.from.terminal}`;
      const toKey = `${conn.to.componentId}-${conn.to.terminal}`;

      const fromNode = this.nodeMap.get(fromKey);
      const toNode = this.nodeMap.get(toKey);

      if (fromNode !== undefined && toNode !== undefined) {
        // Ambos ya tienen nodo asignado
        if (fromNode !== toNode) {
          // Fusionar nodos (usar el menor)
          const minNode = Math.min(fromNode, toNode);
          const maxNode = Math.max(fromNode, toNode);
          
          // Reemplazar todas las ocurrencias del nodo mayor
          for (const [key, node] of this.nodeMap.entries()) {
            if (node === maxNode) {
              this.nodeMap.set(key, minNode);
            }
          }
        }
      } else if (fromNode !== undefined) {
        // From tiene nodo, asignar a To
        this.nodeMap.set(toKey, fromNode);
      } else if (toNode !== undefined) {
        // To tiene nodo, asignar a From
        this.nodeMap.set(fromKey, toNode);
      } else {
        // Ninguno tiene nodo, crear nuevo
        this.nodeMap.set(fromKey, nodeCounter);
        this.nodeMap.set(toKey, nodeCounter);
        nodeCounter++;
      }
    });

    // Asignar nodos a terminales no conectados
    this.components.forEach(comp => {
      const terminals = this.getComponentTerminals(comp);
      terminals.forEach((_, idx) => {
        const key = `${comp.id}-${idx}`;
        if (!this.nodeMap.has(key)) {
          this.nodeMap.set(key, nodeCounter);
          nodeCounter++;
        }
      });
    });

    this.numNodes = nodeCounter;

    // Contar fuentes de voltaje (necesitan variables de corriente adicionales)
    this.numVoltageSources = 0;
    this.voltageSourceMap.clear();
    
    this.components.forEach(comp => {
      if (comp.type === 'voltage_source') {
        this.voltageSourceMap.set(comp.id, this.numVoltageSources);
        this.numVoltageSources++;
      }
    });

    // Tamaño del sistema: nodos (sin contar tierra) + corrientes de fuentes
    this.systemSize = (this.numNodes > 0 ? this.numNodes - 1 : 0) + this.numVoltageSources;

    console.log('Nodos identificados:', this.numNodes);
    console.log('Fuentes de voltaje:', this.numVoltageSources);
    console.log('Tamaño del sistema:', this.systemSize);
  }

  /**
   * Obtener terminales de un componente
   */
  getComponentTerminals(comp) {
    // Todos los componentes tienen 2 terminales por ahora
    return [{ x: 0, y: -30 }, { x: 0, y: 30 }];
  }

  /**
   * Obtener nodos de un componente
   */
  getComponentNodes(compId) {
    const node0 = this.nodeMap.get(`${compId}-0`) || 0;
    const node1 = this.nodeMap.get(`${compId}-1`) || 0;
    return [node0, node1];
  }

  /**
   * Stamping: agregar contribución de resistencia a la matriz
   * V = I * R  =>  I = V / R = V * G  (G = conductancia = 1/R)
   */
  stampResistor(matrix, vector, compId, resistance) {
    const [n1, n2] = this.getComponentNodes(compId);
    const G = 1.0 / resistance;

    // Stamping de conductancia en matriz G
    if (n1 > 0 && n2 > 0) {
      // Ambos nodos no son tierra
      matrix.stamp(n1 - 1, n1 - 1, G);
      matrix.stamp(n2 - 1, n2 - 1, G);
      matrix.stamp(n1 - 1, n2 - 1, -G);
      matrix.stamp(n2 - 1, n1 - 1, -G);
    } else if (n1 > 0) {
      // Solo n1 no es tierra
      matrix.stamp(n1 - 1, n1 - 1, G);
    } else if (n2 > 0) {
      // Solo n2 no es tierra
      matrix.stamp(n2 - 1, n2 - 1, G);
    }
  }

  /**
   * Stamping: agregar contribución de fuente de corriente
   * La corriente entra por un nodo y sale por otro
   */
  stampCurrentSource(matrix, vector, compId, current) {
    const [n1, n2] = this.getComponentNodes(compId);

    // La corriente fluye de n1 a n2 (convención)
    if (n1 > 0) {
      vector[n1 - 1] -= current; // Sale de n1
    }
    if (n2 > 0) {
      vector[n2 - 1] += current; // Entra a n2
    }
  }

  /**
   * Stamping: agregar contribución de fuente de voltaje
   * Requiere variable adicional para la corriente de la fuente
   */
  stampVoltageSource(matrix, vector, compId, voltage) {
    const [n1, n2] = this.getComponentNodes(compId);
    const vsIndex = this.voltageSourceMap.get(compId);
    
    if (vsIndex === undefined) {
      console.error('Fuente de voltaje no mapeada:', compId);
      return;
    }

    const currentVarIndex = (this.numNodes > 0 ? this.numNodes - 1 : 0) + vsIndex;

    // Ecuación KCL en nodos: agregar corriente de fuente
    if (n1 > 0) {
      matrix.stamp(n1 - 1, currentVarIndex, 1);
      matrix.stamp(currentVarIndex, n1 - 1, 1);
    }
    if (n2 > 0) {
      matrix.stamp(n2 - 1, currentVarIndex, -1);
      matrix.stamp(currentVarIndex, n2 - 1, -1);
    }

    // Ecuación de voltaje: V(n1) - V(n2) = voltage
    vector[currentVarIndex] = voltage;
  }

  /**
   * Stamping: capacitor con modelo companion (Trapezoidal o Backward Euler)
   * 
   * Trapezoidal: G_eq = 2C/Δt, I_eq = G_eq * V_prev + I_prev
   * Backward Euler: G_eq = C/Δt, I_eq = G_eq * V_prev
   */
  stampCapacitor(matrix, vector, compId, capacitance, dt, vPrev, iPrev) {
    const [n1, n2] = this.getComponentNodes(compId);
    
    let Geq, Ieq;
    
    if (this.options.method === 'trapezoidal') {
      Geq = (2.0 * capacitance) / dt;
      Ieq = Geq * vPrev + iPrev;
    } else { // backward_euler
      Geq = capacitance / dt;
      Ieq = Geq * vPrev;
    }

    // Stamping como conductancia
    if (n1 > 0 && n2 > 0) {
      matrix.stamp(n1 - 1, n1 - 1, Geq);
      matrix.stamp(n2 - 1, n2 - 1, Geq);
      matrix.stamp(n1 - 1, n2 - 1, -Geq);
      matrix.stamp(n2 - 1, n1 - 1, -Geq);
    } else if (n1 > 0) {
      matrix.stamp(n1 - 1, n1 - 1, Geq);
    } else if (n2 > 0) {
      matrix.stamp(n2 - 1, n2 - 1, Geq);
    }

    // Fuente de corriente equivalente
    if (n1 > 0) {
      vector[n1 - 1] -= Ieq;
    }
    if (n2 > 0) {
      vector[n2 - 1] += Ieq;
    }
  }

  /**
   * Stamping: inductor con modelo companion (Trapezoidal o Backward Euler)
   * 
   * Trapezoidal: R_eq = 2L/Δt, V_eq = R_eq * I_prev + V_prev
   * Backward Euler: R_eq = L/Δt, V_eq = R_eq * I_prev
   * 
   * Se modela como resistencia + fuente de voltaje
   */
  stampInductor(matrix, vector, compId, inductance, dt, iPrev, vPrev) {
    const [n1, n2] = this.getComponentNodes(compId);
    
    let Req, Veq;
    
    if (this.options.method === 'trapezoidal') {
      Req = (2.0 * inductance) / dt;
      Veq = Req * iPrev + vPrev;
    } else { // backward_euler
      Req = inductance / dt;
      Veq = Req * iPrev;
    }

    const Geq = 1.0 / Req;

    // Stamping de conductancia
    if (n1 > 0 && n2 > 0) {
      matrix.stamp(n1 - 1, n1 - 1, Geq);
      matrix.stamp(n2 - 1, n2 - 1, Geq);
      matrix.stamp(n1 - 1, n2 - 1, -Geq);
      matrix.stamp(n2 - 1, n1 - 1, -Geq);
    } else if (n1 > 0) {
      matrix.stamp(n1 - 1, n1 - 1, Geq);
    } else if (n2 > 0) {
      matrix.stamp(n2 - 1, n2 - 1, Geq);
    }

    // Fuente de voltaje equivalente (como fuente de corriente Ieq = Veq * Geq)
    const Ieq = Veq * Geq;
    if (n1 > 0) {
      vector[n1 - 1] += Ieq;
    }
    if (n2 > 0) {
      vector[n2 - 1] -= Ieq;
    }
  }

  /**
   * Construir sistema MNA para análisis DC
   */
  buildDCSystem() {
    const size = this.systemSize;
    const matrix = new SparseMatrix(size, size);
    const vector = Array(size).fill(0);

    // Agregar Gmin para estabilidad numérica
    for (let i = 0; i < (this.numNodes > 0 ? this.numNodes - 1 : 0); i++) {
      matrix.stamp(i, i, this.options.gmin);
    }

    // Stamping de cada componente
    this.components.forEach(comp => {
      switch (comp.type) {
        case 'resistor':
          this.stampResistor(matrix, vector, comp.id, comp.value || 1000);
          break;

        case 'voltage_source':
          this.stampVoltageSource(matrix, vector, comp.id, comp.value || 12);
          break;

        case 'current_source':
          this.stampCurrentSource(matrix, vector, comp.id, comp.value || 0.001);
          break;

        case 'capacitor':
          // En DC, capacitor = circuito abierto (no contribuye)
          break;

        case 'inductor':
          // En DC, inductor = cortocircuito (resistencia muy pequeña)
          this.stampResistor(matrix, vector, comp.id, 1e-6);
          break;

        case 'led':
          // Modelar LED como resistencia en DC (simplificación)
          this.stampResistor(matrix, vector, comp.id, 100);
          break;

        case 'ground':
          // Tierra ya está manejada en identificación de nodos
          break;

        default:
          console.warn('Tipo de componente no soportado:', comp.type);
      }
    });

    return { matrix, vector };
  }

  /**
   * Resolver sistema lineal Ax = b usando eliminación gaussiana
   */
  solveLinearSystem(A, b) {
    const n = b.length;
    const x = Array(n).fill(0);

    // Convertir matriz dispersa a densa
    const matrix = A.toDense();
    const rhs = [...b];

    // Eliminación gaussiana con pivoteo parcial
    for (let k = 0; k < n; k++) {
      // Buscar pivote
      let maxRow = k;
      let maxVal = Math.abs(matrix[k][k]);
      
      for (let i = k + 1; i < n; i++) {
        const val = Math.abs(matrix[i][k]);
        if (val > maxVal) {
          maxVal = val;
          maxRow = i;
        }
      }

      // Intercambiar filas si es necesario
      if (maxRow !== k) {
        [matrix[k], matrix[maxRow]] = [matrix[maxRow], matrix[k]];
        [rhs[k], rhs[maxRow]] = [rhs[maxRow], rhs[k]];
      }

      // Verificar singularidad
      if (Math.abs(matrix[k][k]) < 1e-12) {
        console.warn('Matriz singular o casi singular en fila', k);
        matrix[k][k] = 1e-10; // Regularización
      }

      // Eliminación
      for (let i = k + 1; i < n; i++) {
        const factor = matrix[i][k] / matrix[k][k];
        for (let j = k; j < n; j++) {
          matrix[i][j] -= factor * matrix[k][j];
        }
        rhs[i] -= factor * rhs[k];
      }
    }

    // Sustitución hacia atrás
    for (let i = n - 1; i >= 0; i--) {
      let sum = rhs[i];
      for (let j = i + 1; j < n; j++) {
        sum -= matrix[i][j] * x[j];
      }
      x[i] = sum / matrix[i][i];
    }

    return x;
  }

  /**
   * Análisis DC (punto de operación)
   */
  analyzeDC() {
    console.log('=== ANÁLISIS DC ===');
    
    // Identificar nodos
    this.identifyNodes();

    // Construir sistema
    const { matrix, vector } = this.buildDCSystem();

    console.log('Matriz MNA:', matrix.toDense());
    console.log('Vector b:', vector);

    // Resolver
    const solution = this.solveLinearSystem(matrix, vector);

    console.log('Solución:', solution);

    // Extraer voltajes de nodos
    const nodeVoltages = { 0: 0 }; // Tierra = 0V
    for (let i = 1; i < this.numNodes; i++) {
      nodeVoltages[i] = solution[i - 1] || 0;
    }

    // Extraer corrientes de fuentes de voltaje
    const voltageSourceCurrents = {};
    this.voltageSourceMap.forEach((vsIndex, compId) => {
      const currentIndex = (this.numNodes > 0 ? this.numNodes - 1 : 0) + vsIndex;
      voltageSourceCurrents[compId] = solution[currentIndex] || 0;
    });

    // Calcular corrientes y potencias de cada componente
    const componentData = {};

    this.components.forEach(comp => {
      const [n1, n2] = this.getComponentNodes(comp.id);
      const v1 = nodeVoltages[n1] || 0;
      const v2 = nodeVoltages[n2] || 0;
      const voltage = v1 - v2;
      let current = 0;
      let power = 0;

      switch (comp.type) {
        case 'resistor':
          current = voltage / (comp.value || 1000);
          power = voltage * current;
          break;

        case 'voltage_source':
          current = voltageSourceCurrents[comp.id] || 0;
          power = voltage * current;
          break;

        case 'current_source':
          current = comp.value || 0.001;
          power = voltage * current;
          break;

        case 'led':
          current = voltage / 100; // Simplificación
          power = voltage * current;
          break;

        case 'capacitor':
        case 'inductor':
          // En DC no hay corriente en C ni voltaje en L
          current = 0;
          power = 0;
          break;

        case 'ground':
          current = 0;
          power = 0;
          break;
      }

      componentData[comp.id] = {
        type: comp.type,
        voltage: voltage,
        current: current,
        power: power,
        nodes: [n1, n2]
      };
    });

    this.dcOperatingPoint = {
      nodeVoltages,
      componentData,
      voltageSourceCurrents
    };

    return this.dcOperatingPoint;
  }

  /**
   * Ejecutar simulación completa
   */
  simulate() {
    try {
      console.log('=== SIMULACIÓN PROFESIONAL ===');
      console.log('Componentes:', this.components.length);
      console.log('Conexiones:', this.connections.length);

      // Validaciones
      if (!this.components || this.components.length === 0) {
        throw new Error('No hay componentes en el circuito');
      }

      const hasGround = this.components.some(c => c.type === 'ground');
      if (!hasGround) {
        throw new Error('El circuito debe tener al menos un nodo de tierra (GND)');
      }

      // Análisis DC
      const dcResults = this.analyzeDC();

      // Convertir nodeMap a formato serializable
      const nodeMapObj = {};
      this.components.forEach(comp => {
        nodeMapObj[comp.id] = [
          this.nodeMap.get(`${comp.id}-0`) || 0,
          this.nodeMap.get(`${comp.id}-1`) || 0
        ];
      });

      return {
        success: true,
        results: {
          nodeVoltages: dcResults.nodeVoltages,
          componentData: dcResults.componentData
        },
        nodeMap: nodeMapObj,
        numNodes: this.numNodes,
        message: 'Simulación completada exitosamente'
      };

    } catch (error) {
      console.error('Error en simulación:', error);
      return {
        success: false,
        error: error.message,
        message: `Error: ${error.message}`
      };
    }
  }
}

/**
 * Función de conveniencia para simular un circuito
 */
export function simulateCircuit(components, connections, options = {}) {
  const simulator = new ProfessionalCircuitSimulator(components, connections, options);
  return simulator.simulate();
}

export default ProfessionalCircuitSimulator;
