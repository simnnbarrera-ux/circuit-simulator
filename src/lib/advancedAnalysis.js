/**
 * Módulo de Análisis Avanzados para Simulador de Circuitos
 * 
 * Incluye:
 * - Análisis AC (respuesta en frecuencia)
 * - Análisis Transitorio (dominio del tiempo)
 * - FFT (Fast Fourier Transform)
 * - Diagramas de Bode (magnitud y fase)
 * - Análisis de estabilidad
 */

/**
 * Clase para números complejos
 */
class Complex {
  constructor(real, imag = 0) {
    this.real = real;
    this.imag = imag;
  }

  /**
   * Magnitud del número complejo
   */
  magnitude() {
    return Math.sqrt(this.real * this.real + this.imag * this.imag);
  }

  /**
   * Fase del número complejo (en radianes)
   */
  phase() {
    return Math.atan2(this.imag, this.real);
  }

  /**
   * Fase en grados
   */
  phaseDegrees() {
    return this.phase() * (180 / Math.PI);
  }

  /**
   * Suma de números complejos
   */
  add(other) {
    return new Complex(this.real + other.real, this.imag + other.imag);
  }

  /**
   * Resta de números complejos
   */
  subtract(other) {
    return new Complex(this.real - other.real, this.imag - other.imag);
  }

  /**
   * Multiplicación de números complejos
   */
  multiply(other) {
    const real = this.real * other.real - this.imag * other.imag;
    const imag = this.real * other.imag + this.imag * other.real;
    return new Complex(real, imag);
  }

  /**
   * División de números complejos
   */
  divide(other) {
    const denominator = other.real * other.real + other.imag * other.imag;
    const real = (this.real * other.real + this.imag * other.imag) / denominator;
    const imag = (this.imag * other.real - this.real * other.imag) / denominator;
    return new Complex(real, imag);
  }

  /**
   * Conjugado
   */
  conjugate() {
    return new Complex(this.real, -this.imag);
  }

  /**
   * Convertir a string
   */
  toString() {
    if (this.imag >= 0) {
      return `${this.real.toFixed(6)} + ${this.imag.toFixed(6)}j`;
    } else {
      return `${this.real.toFixed(6)} - ${Math.abs(this.imag).toFixed(6)}j`;
    }
  }

  /**
   * Magnitud en dB
   */
  toDb() {
    return 20 * Math.log10(this.magnitude());
  }
}

/**
 * Matriz compleja para análisis AC
 */
class ComplexMatrix {
  constructor(rows, cols) {
    this.rows = rows;
    this.cols = cols;
    this.data = Array(rows).fill(null).map(() => 
      Array(cols).fill(null).map(() => new Complex(0, 0))
    );
  }

  /**
   * Establecer valor en posición (i, j)
   */
  set(i, j, value) {
    if (value instanceof Complex) {
      this.data[i][j] = value;
    } else {
      this.data[i][j] = new Complex(value, 0);
    }
  }

  /**
   * Obtener valor en posición (i, j)
   */
  get(i, j) {
    return this.data[i][j];
  }

  /**
   * Agregar valor a posición existente
   */
  add(i, j, value) {
    if (value instanceof Complex) {
      this.data[i][j] = this.data[i][j].add(value);
    } else {
      this.data[i][j] = this.data[i][j].add(new Complex(value, 0));
    }
  }
}

/**
 * Análisis AC (respuesta en frecuencia)
 */
export class ACAnalysis {
  constructor(simulator) {
    this.simulator = simulator;
  }

  /**
   * Calcular impedancia de capacitor: Z = 1/(jωC)
   */
  capacitorImpedance(capacitance, omega) {
    // Z = 1/(jωC) = -j/(ωC)
    return new Complex(0, -1 / (omega * capacitance));
  }

  /**
   * Calcular impedancia de inductor: Z = jωL
   */
  inductorImpedance(inductance, omega) {
    // Z = jωL
    return new Complex(0, omega * inductance);
  }

  /**
   * Construir sistema MNA para una frecuencia específica
   */
  buildACSystem(omega) {
    const size = this.simulator.systemSize;
    const matrix = new ComplexMatrix(size, size);
    const vector = Array(size).fill(null).map(() => new Complex(0, 0));

    // Agregar Gmin para estabilidad
    for (let i = 0; i < (this.simulator.numNodes > 0 ? this.simulator.numNodes - 1 : 0); i++) {
      matrix.add(i, i, this.simulator.options.gmin);
    }

    // Stamping de cada componente
    this.simulator.components.forEach(comp => {
      const [n1, n2] = this.simulator.getComponentNodes(comp.id);

      switch (comp.type) {
        case 'resistor':
          {
            const G = 1.0 / (comp.value || 1000);
            if (n1 > 0 && n2 > 0) {
              matrix.add(n1 - 1, n1 - 1, G);
              matrix.add(n2 - 1, n2 - 1, G);
              matrix.add(n1 - 1, n2 - 1, -G);
              matrix.add(n2 - 1, n1 - 1, -G);
            } else if (n1 > 0) {
              matrix.add(n1 - 1, n1 - 1, G);
            } else if (n2 > 0) {
              matrix.add(n2 - 1, n2 - 1, G);
            }
          }
          break;

        case 'capacitor':
          {
            // Y = jωC (admitancia)
            const Y = new Complex(0, omega * (comp.value || 1e-6));
            if (n1 > 0 && n2 > 0) {
              matrix.add(n1 - 1, n1 - 1, Y);
              matrix.add(n2 - 1, n2 - 1, Y);
              matrix.add(n1 - 1, n2 - 1, Y.multiply(new Complex(-1, 0)));
              matrix.add(n2 - 1, n1 - 1, Y.multiply(new Complex(-1, 0)));
            } else if (n1 > 0) {
              matrix.add(n1 - 1, n1 - 1, Y);
            } else if (n2 > 0) {
              matrix.add(n2 - 1, n2 - 1, Y);
            }
          }
          break;

        case 'inductor':
          {
            // Y = 1/(jωL) = -j/(ωL) (admitancia)
            const Y = new Complex(0, -1 / (omega * (comp.value || 1e-3)));
            if (n1 > 0 && n2 > 0) {
              matrix.add(n1 - 1, n1 - 1, Y);
              matrix.add(n2 - 1, n2 - 1, Y);
              matrix.add(n1 - 1, n2 - 1, Y.multiply(new Complex(-1, 0)));
              matrix.add(n2 - 1, n1 - 1, Y.multiply(new Complex(-1, 0)));
            } else if (n1 > 0) {
              matrix.add(n1 - 1, n1 - 1, Y);
            } else if (n2 > 0) {
              matrix.add(n2 - 1, n2 - 1, Y);
            }
          }
          break;

        case 'voltage_source':
          {
            const vsIndex = this.simulator.voltageSourceMap.get(comp.id);
            if (vsIndex !== undefined) {
              const currentVarIndex = (this.simulator.numNodes > 0 ? this.simulator.numNodes - 1 : 0) + vsIndex;
              
              if (n1 > 0) {
                matrix.set(n1 - 1, currentVarIndex, new Complex(1, 0));
                matrix.set(currentVarIndex, n1 - 1, new Complex(1, 0));
              }
              if (n2 > 0) {
                matrix.set(n2 - 1, currentVarIndex, new Complex(-1, 0));
                matrix.set(currentVarIndex, n2 - 1, new Complex(-1, 0));
              }
              
              // Voltaje AC (pequeña señal)
              vector[currentVarIndex] = new Complex(comp.acMagnitude || 1, 0);
            }
          }
          break;

        case 'current_source':
          {
            // Fuente de corriente AC
            const current = new Complex(comp.acMagnitude || 0, 0);
            if (n1 > 0) {
              vector[n1 - 1] = vector[n1 - 1].subtract(current);
            }
            if (n2 > 0) {
              vector[n2 - 1] = vector[n2 - 1].add(current);
            }
          }
          break;
      }
    });

    return { matrix, vector };
  }

  /**
   * Resolver sistema lineal complejo
   */
  solveComplexSystem(matrix, b) {
    const n = b.length;
    const A = matrix.data.map(row => [...row]);
    const x = Array(n).fill(null).map(() => new Complex(0, 0));
    const rhs = [...b];

    // Eliminación gaussiana con pivoteo parcial
    for (let k = 0; k < n; k++) {
      // Buscar pivote
      let maxRow = k;
      let maxVal = A[k][k].magnitude();
      
      for (let i = k + 1; i < n; i++) {
        const val = A[i][k].magnitude();
        if (val > maxVal) {
          maxVal = val;
          maxRow = i;
        }
      }

      // Intercambiar filas
      if (maxRow !== k) {
        [A[k], A[maxRow]] = [A[maxRow], A[k]];
        [rhs[k], rhs[maxRow]] = [rhs[maxRow], rhs[k]];
      }

      // Verificar singularidad
      if (A[k][k].magnitude() < 1e-12) {
        A[k][k] = new Complex(1e-10, 0);
      }

      // Eliminación
      for (let i = k + 1; i < n; i++) {
        const factor = A[i][k].divide(A[k][k]);
        for (let j = k; j < n; j++) {
          A[i][j] = A[i][j].subtract(factor.multiply(A[k][j]));
        }
        rhs[i] = rhs[i].subtract(factor.multiply(rhs[k]));
      }
    }

    // Sustitución hacia atrás
    for (let i = n - 1; i >= 0; i--) {
      let sum = rhs[i];
      for (let j = i + 1; j < n; j++) {
        sum = sum.subtract(A[i][j].multiply(x[j]));
      }
      x[i] = sum.divide(A[i][i]);
    }

    return x;
  }

  /**
   * Realizar barrido de frecuencia (análisis AC)
   * @param {number} startFreq - Frecuencia inicial (Hz)
   * @param {number} endFreq - Frecuencia final (Hz)
   * @param {number} pointsPerDecade - Puntos por década
   */
  frequencySweep(startFreq = 1, endFreq = 1e6, pointsPerDecade = 10) {
    console.log('=== ANÁLISIS AC ===');
    console.log(`Barrido: ${startFreq} Hz - ${endFreq} Hz`);

    const results = [];
    const decades = Math.log10(endFreq / startFreq);
    const numPoints = Math.ceil(decades * pointsPerDecade);

    for (let i = 0; i <= numPoints; i++) {
      const freq = startFreq * Math.pow(10, (i * decades) / numPoints);
      const omega = 2 * Math.PI * freq;

      // Construir y resolver sistema para esta frecuencia
      const { matrix, vector } = this.buildACSystem(omega);
      const solution = this.solveComplexSystem(matrix, vector);

      // Extraer voltajes de nodos
      const nodeVoltages = { 0: new Complex(0, 0) };
      for (let j = 1; j < this.simulator.numNodes; j++) {
        nodeVoltages[j] = solution[j - 1] || new Complex(0, 0);
      }

      results.push({
        frequency: freq,
        omega: omega,
        nodeVoltages: nodeVoltages
      });
    }

    return results;
  }

  /**
   * Generar diagrama de Bode
   */
  generateBodePlot(inputNode, outputNode, startFreq = 1, endFreq = 1e6) {
    const sweepResults = this.frequencySweep(startFreq, endFreq);

    const bodePlot = sweepResults.map(result => {
      const inputVoltage = result.nodeVoltages[inputNode] || new Complex(1, 0);
      const outputVoltage = result.nodeVoltages[outputNode] || new Complex(0, 0);
      
      // Ganancia = Vout / Vin
      const gain = outputVoltage.divide(inputVoltage);

      return {
        frequency: result.frequency,
        magnitudeDb: gain.toDb(),
        phaseDegrees: gain.phaseDegrees()
      };
    });

    return bodePlot;
  }
}

/**
 * Análisis Transitorio (dominio del tiempo)
 */
export class TransientAnalysis {
  constructor(simulator) {
    this.simulator = simulator;
    this.history = {
      capacitors: new Map(), // Voltajes previos de capacitores
      inductors: new Map()   // Corrientes previas de inductores
    };
  }

  /**
   * Inicializar estados de elementos dinámicos
   */
  initialize() {
    this.simulator.components.forEach(comp => {
      if (comp.type === 'capacitor') {
        this.history.capacitors.set(comp.id, { voltage: 0, current: 0 });
      } else if (comp.type === 'inductor') {
        this.history.inductors.set(comp.id, { current: 0, voltage: 0 });
      }
    });
  }

  /**
   * Ejecutar análisis transitorio
   * @param {number} duration - Duración de la simulación (segundos)
   * @param {number} timeStep - Paso de tiempo (segundos)
   */
  run(duration = 1e-3, timeStep = 1e-6) {
    console.log('=== ANÁLISIS TRANSITORIO ===');
    console.log(`Duración: ${duration}s, Paso: ${timeStep}s`);

    this.initialize();

    const results = [];
    const numSteps = Math.ceil(duration / timeStep);

    for (let step = 0; step <= numSteps; step++) {
      const time = step * timeStep;

      // Construir sistema para este instante
      const { matrix, vector } = this.buildTransientSystem(timeStep);

      // Resolver
      const solution = this.simulator.solveLinearSystem(matrix, vector);

      // Extraer voltajes de nodos
      const nodeVoltages = { 0: 0 };
      for (let i = 1; i < this.simulator.numNodes; i++) {
        nodeVoltages[i] = solution[i - 1] || 0;
      }

      // Actualizar estados de elementos dinámicos
      this.updateDynamicElements(nodeVoltages, timeStep);

      results.push({
        time: time,
        nodeVoltages: { ...nodeVoltages }
      });
    }

    return results;
  }

  /**
   * Construir sistema MNA para análisis transitorio
   */
  buildTransientSystem(dt) {
    const size = this.simulator.systemSize;
    const matrix = new this.simulator.constructor.SparseMatrix(size, size);
    const vector = Array(size).fill(0);

    // Gmin para estabilidad
    for (let i = 0; i < (this.simulator.numNodes > 0 ? this.simulator.numNodes - 1 : 0); i++) {
      matrix.stamp(i, i, this.simulator.options.gmin);
    }

    // Stamping de componentes
    this.simulator.components.forEach(comp => {
      switch (comp.type) {
        case 'resistor':
          this.simulator.stampResistor(matrix, vector, comp.id, comp.value || 1000);
          break;

        case 'voltage_source':
          // Fuente puede variar con el tiempo (señal)
          const voltage = this.getSourceValue(comp, 0); // Implementar señales
          this.simulator.stampVoltageSource(matrix, vector, comp.id, voltage);
          break;

        case 'current_source':
          const current = this.getSourceValue(comp, 0);
          this.simulator.stampCurrentSource(matrix, vector, comp.id, current);
          break;

        case 'capacitor':
          {
            const history = this.history.capacitors.get(comp.id);
            this.simulator.stampCapacitor(
              matrix, vector, comp.id,
              comp.value || 1e-6,
              dt,
              history.voltage,
              history.current
            );
          }
          break;

        case 'inductor':
          {
            const history = this.history.inductors.get(comp.id);
            this.simulator.stampInductor(
              matrix, vector, comp.id,
              comp.value || 1e-3,
              dt,
              history.current,
              history.voltage
            );
          }
          break;
      }
    });

    return { matrix, vector };
  }

  /**
   * Obtener valor de fuente en el tiempo (soportar señales)
   */
  getSourceValue(comp, time) {
    // Por ahora, valor constante
    // TODO: Implementar señales (senoidal, pulso, rampa, etc.)
    return comp.value || 0;
  }

  /**
   * Actualizar estados de elementos dinámicos
   */
  updateDynamicElements(nodeVoltages, dt) {
    this.simulator.components.forEach(comp => {
      if (comp.type === 'capacitor') {
        const [n1, n2] = this.simulator.getComponentNodes(comp.id);
        const voltage = (nodeVoltages[n1] || 0) - (nodeVoltages[n2] || 0);
        const history = this.history.capacitors.get(comp.id);
        
        // Calcular corriente: i = C * dv/dt
        const current = (comp.value || 1e-6) * (voltage - history.voltage) / dt;
        
        this.history.capacitors.set(comp.id, { voltage, current });
      } else if (comp.type === 'inductor') {
        const [n1, n2] = this.simulator.getComponentNodes(comp.id);
        const voltage = (nodeVoltages[n1] || 0) - (nodeVoltages[n2] || 0);
        const history = this.history.inductors.get(comp.id);
        
        // Calcular corriente: v = L * di/dt  =>  i = i_prev + (v * dt / L)
        const current = history.current + (voltage * dt / (comp.value || 1e-3));
        
        this.history.inductors.set(comp.id, { current, voltage });
      }
    });
  }
}

/**
 * FFT (Fast Fourier Transform) para análisis espectral
 */
export class FFTAnalyzer {
  /**
   * FFT usando algoritmo Cooley-Tukey
   * @param {Array} signal - Señal de entrada (debe ser potencia de 2)
   */
  static fft(signal) {
    const n = signal.length;
    
    if (n <= 1) return signal.map(x => new Complex(x, 0));
    
    // Verificar que sea potencia de 2
    if ((n & (n - 1)) !== 0) {
      throw new Error('FFT requiere longitud potencia de 2');
    }

    // Dividir en pares e impares
    const even = [];
    const odd = [];
    for (let i = 0; i < n; i++) {
      if (i % 2 === 0) {
        even.push(signal[i]);
      } else {
        odd.push(signal[i]);
      }
    }

    // Recursión
    const evenFFT = this.fft(even);
    const oddFFT = this.fft(odd);

    // Combinar
    const result = Array(n);
    for (let k = 0; k < n / 2; k++) {
      const angle = -2 * Math.PI * k / n;
      const twiddle = new Complex(Math.cos(angle), Math.sin(angle));
      const t = twiddle.multiply(oddFFT[k]);
      
      result[k] = evenFFT[k].add(t);
      result[k + n / 2] = evenFFT[k].subtract(t);
    }

    return result;
  }

  /**
   * Calcular espectro de potencia
   */
  static powerSpectrum(signal, sampleRate) {
    const fftResult = this.fft(signal);
    const n = signal.length;
    
    const spectrum = fftResult.slice(0, n / 2).map((c, i) => ({
      frequency: i * sampleRate / n,
      magnitude: c.magnitude(),
      magnitudeDb: c.toDb(),
      phase: c.phaseDegrees()
    }));

    return spectrum;
  }

  /**
   * Aplicar ventana de Hann para reducir leakage espectral
   */
  static applyHannWindow(signal) {
    const n = signal.length;
    return signal.map((x, i) => {
      const window = 0.5 * (1 - Math.cos(2 * Math.PI * i / (n - 1)));
      return x * window;
    });
  }
}

export default {
  ACAnalysis,
  TransientAnalysis,
  FFTAnalyzer,
  Complex
};
