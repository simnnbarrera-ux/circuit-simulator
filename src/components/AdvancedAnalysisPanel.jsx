import React, { useState } from 'react';

/**
 * Panel de Análisis Avanzado
 * 
 * Permite configurar y ejecutar diferentes tipos de análisis:
 * - DC Operating Point
 * - AC Analysis (Bode plots)
 * - Transient Analysis
 * - FFT / Spectrum Analysis
 */
const AdvancedAnalysisPanel = ({ 
  onRunAnalysis, 
  onClose,
  isRunning = false 
}) => {
  const [analysisType, setAnalysisType] = useState('dc');
  const [dcOptions, setDcOptions] = useState({
    temperature: 27, // °C
    gmin: 1e-12
  });

  const [acOptions, setAcOptions] = useState({
    startFreq: 1,
    endFreq: 1e6,
    pointsPerDecade: 10,
    variation: 'decade', // 'decade', 'octave', 'linear'
    inputNode: 1,
    outputNode: 2
  });

  const [transientOptions, setTransientOptions] = useState({
    duration: 1e-3, // 1 ms
    timeStep: 1e-6, // 1 µs
    method: 'trapezoidal', // 'trapezoidal', 'backward_euler', 'gear'
    maxStep: 1e-5,
    tolerance: 1e-6
  });

  const [fftOptions, setFftOptions] = useState({
    node: 1,
    window: 'hann', // 'hann', 'hamming', 'blackman', 'rectangular'
    fftSize: 1024
  });

  /**
   * Ejecutar análisis
   */
  const handleRunAnalysis = () => {
    let options = {};
    
    switch (analysisType) {
      case 'dc':
        options = dcOptions;
        break;
      case 'ac':
        options = acOptions;
        break;
      case 'transient':
        options = transientOptions;
        break;
      case 'fft':
        options = { ...fftOptions, ...transientOptions };
        break;
    }

    onRunAnalysis(analysisType, options);
  };

  /**
   * Renderizar opciones según tipo de análisis
   */
  const renderOptions = () => {
    switch (analysisType) {
      case 'dc':
        return renderDCOptions();
      case 'ac':
        return renderACOptions();
      case 'transient':
        return renderTransientOptions();
      case 'fft':
        return renderFFTOptions();
      default:
        return null;
    }
  };

  /**
   * Opciones de análisis DC
   */
  const renderDCOptions = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div>
        <label style={{ display: 'block', marginBottom: '4px', color: '#ccc', fontSize: '13px' }}>
          Temperatura (°C)
        </label>
        <input
          type="number"
          value={dcOptions.temperature}
          onChange={(e) => setDcOptions({ ...dcOptions, temperature: parseFloat(e.target.value) })}
          style={inputStyle}
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '4px', color: '#ccc', fontSize: '13px' }}>
          Gmin (conductancia mínima)
        </label>
        <input
          type="number"
          value={dcOptions.gmin}
          onChange={(e) => setDcOptions({ ...dcOptions, gmin: parseFloat(e.target.value) })}
          step="1e-12"
          style={inputStyle}
        />
      </div>

      <div style={{ 
        padding: '12px', 
        backgroundColor: '#2a3a4a', 
        borderRadius: '4px',
        fontSize: '12px',
        color: '#aaa'
      }}>
        <strong style={{ color: '#4a9eff' }}>ℹ️ Análisis DC</strong>
        <p style={{ margin: '8px 0 0 0' }}>
          Calcula el punto de operación en estado estacionario. Los capacitores se tratan como circuito abierto 
          y los inductores como cortocircuito.
        </p>
      </div>
    </div>
  );

  /**
   * Opciones de análisis AC
   */
  const renderACOptions = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '4px', color: '#ccc', fontSize: '13px' }}>
            Frecuencia inicial (Hz)
          </label>
          <input
            type="number"
            value={acOptions.startFreq}
            onChange={(e) => setAcOptions({ ...acOptions, startFreq: parseFloat(e.target.value) })}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '4px', color: '#ccc', fontSize: '13px' }}>
            Frecuencia final (Hz)
          </label>
          <input
            type="number"
            value={acOptions.endFreq}
            onChange={(e) => setAcOptions({ ...acOptions, endFreq: parseFloat(e.target.value) })}
            style={inputStyle}
          />
        </div>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '4px', color: '#ccc', fontSize: '13px' }}>
          Puntos por década
        </label>
        <input
          type="number"
          value={acOptions.pointsPerDecade}
          onChange={(e) => setAcOptions({ ...acOptions, pointsPerDecade: parseInt(e.target.value) })}
          min="5"
          max="100"
          style={inputStyle}
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '4px', color: '#ccc', fontSize: '13px' }}>
          Tipo de barrido
        </label>
        <select
          value={acOptions.variation}
          onChange={(e) => setAcOptions({ ...acOptions, variation: e.target.value })}
          style={selectStyle}
        >
          <option value="decade">Década (logarítmico)</option>
          <option value="octave">Octava</option>
          <option value="linear">Lineal</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '4px', color: '#ccc', fontSize: '13px' }}>
            Nodo de entrada
          </label>
          <input
            type="number"
            value={acOptions.inputNode}
            onChange={(e) => setAcOptions({ ...acOptions, inputNode: parseInt(e.target.value) })}
            min="0"
            style={inputStyle}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '4px', color: '#ccc', fontSize: '13px' }}>
            Nodo de salida
          </label>
          <input
            type="number"
            value={acOptions.outputNode}
            onChange={(e) => setAcOptions({ ...acOptions, outputNode: parseInt(e.target.value) })}
            min="0"
            style={inputStyle}
          />
        </div>
      </div>

      <div style={{ 
        padding: '12px', 
        backgroundColor: '#2a3a4a', 
        borderRadius: '4px',
        fontSize: '12px',
        color: '#aaa'
      }}>
        <strong style={{ color: '#4a9eff' }}>ℹ️ Análisis AC</strong>
        <p style={{ margin: '8px 0 0 0' }}>
          Calcula la respuesta en frecuencia del circuito linearizado. Genera diagramas de Bode 
          (magnitud y fase) para análisis de filtros y amplificadores.
        </p>
      </div>
    </div>
  );

  /**
   * Opciones de análisis transitorio
   */
  const renderTransientOptions = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '4px', color: '#ccc', fontSize: '13px' }}>
            Duración (s)
          </label>
          <input
            type="number"
            value={transientOptions.duration}
            onChange={(e) => setTransientOptions({ ...transientOptions, duration: parseFloat(e.target.value) })}
            step="1e-6"
            style={inputStyle}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '4px', color: '#ccc', fontSize: '13px' }}>
            Paso de tiempo (s)
          </label>
          <input
            type="number"
            value={transientOptions.timeStep}
            onChange={(e) => setTransientOptions({ ...transientOptions, timeStep: parseFloat(e.target.value) })}
            step="1e-9"
            style={inputStyle}
          />
        </div>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '4px', color: '#ccc', fontSize: '13px' }}>
          Método de integración
        </label>
        <select
          value={transientOptions.method}
          onChange={(e) => setTransientOptions({ ...transientOptions, method: e.target.value })}
          style={selectStyle}
        >
          <option value="trapezoidal">Trapezoidal (2º orden, A-estable)</option>
          <option value="backward_euler">Backward Euler (1º orden, estable)</option>
          <option value="gear">Gear/BDF (orden variable)</option>
        </select>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '4px', color: '#ccc', fontSize: '13px' }}>
          Paso máximo (s)
        </label>
        <input
          type="number"
          value={transientOptions.maxStep}
          onChange={(e) => setTransientOptions({ ...transientOptions, maxStep: parseFloat(e.target.value) })}
          step="1e-6"
          style={inputStyle}
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '4px', color: '#ccc', fontSize: '13px' }}>
          Tolerancia
        </label>
        <input
          type="number"
          value={transientOptions.tolerance}
          onChange={(e) => setTransientOptions({ ...transientOptions, tolerance: parseFloat(e.target.value) })}
          step="1e-9"
          style={inputStyle}
        />
      </div>

      <div style={{ 
        padding: '12px', 
        backgroundColor: '#2a3a4a', 
        borderRadius: '4px',
        fontSize: '12px',
        color: '#aaa'
      }}>
        <strong style={{ color: '#4a9eff' }}>ℹ️ Análisis Transitorio</strong>
        <p style={{ margin: '8px 0 0 0' }}>
          Simula la evolución temporal del circuito. Usa modelos companion para elementos dinámicos 
          (C, L) y métodos de integración numérica robustos.
        </p>
      </div>
    </div>
  );

  /**
   * Opciones de análisis FFT
   */
  const renderFFTOptions = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div>
        <label style={{ display: 'block', marginBottom: '4px', color: '#ccc', fontSize: '13px' }}>
          Nodo a analizar
        </label>
        <input
          type="number"
          value={fftOptions.node}
          onChange={(e) => setFftOptions({ ...fftOptions, node: parseInt(e.target.value) })}
          min="0"
          style={inputStyle}
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '4px', color: '#ccc', fontSize: '13px' }}>
          Ventana
        </label>
        <select
          value={fftOptions.window}
          onChange={(e) => setFftOptions({ ...fftOptions, window: e.target.value })}
          style={selectStyle}
        >
          <option value="hann">Hann (recomendada)</option>
          <option value="hamming">Hamming</option>
          <option value="blackman">Blackman</option>
          <option value="rectangular">Rectangular</option>
        </select>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '4px', color: '#ccc', fontSize: '13px' }}>
          Tamaño FFT
        </label>
        <select
          value={fftOptions.fftSize}
          onChange={(e) => setFftOptions({ ...fftOptions, fftSize: parseInt(e.target.value) })}
          style={selectStyle}
        >
          <option value={256}>256</option>
          <option value={512}>512</option>
          <option value={1024}>1024</option>
          <option value={2048}>2048</option>
          <option value={4096}>4096</option>
        </select>
      </div>

      {renderTransientOptions()}

      <div style={{ 
        padding: '12px', 
        backgroundColor: '#2a3a4a', 
        borderRadius: '4px',
        fontSize: '12px',
        color: '#aaa'
      }}>
        <strong style={{ color: '#4a9eff' }}>ℹ️ Análisis FFT</strong>
        <p style={{ margin: '8px 0 0 0' }}>
          Realiza análisis transitorio y luego aplica FFT para obtener el espectro de frecuencias. 
          Útil para análisis de armónicos y distorsión.
        </p>
      </div>
    </div>
  );

  const inputStyle = {
    width: '100%',
    padding: '8px',
    backgroundColor: '#1a1a1a',
    border: '1px solid #444',
    borderRadius: '4px',
    color: 'white',
    fontSize: '13px'
  };

  const selectStyle = {
    ...inputStyle,
    cursor: 'pointer'
  };

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '600px',
      maxHeight: '80vh',
      backgroundColor: '#1a1a1a',
      border: '2px solid #444',
      borderRadius: '8px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px',
        backgroundColor: '#2a2a2a',
        borderBottom: '1px solid #444',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h3 style={{ margin: 0, color: '#4a9eff', fontSize: '18px' }}>
          🔬 Análisis Avanzado
        </h3>
        <button
          onClick={onClose}
          style={{
            background: '#ff4444',
            border: 'none',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          ✕ Cerrar
        </button>
      </div>

      {/* Analysis type selector */}
      <div style={{
        padding: '16px',
        backgroundColor: '#222',
        borderBottom: '1px solid #444',
        display: 'flex',
        gap: '8px'
      }}>
        <button
          onClick={() => setAnalysisType('dc')}
          style={{
            flex: 1,
            padding: '10px',
            background: analysisType === 'dc' ? '#4a9eff' : '#333',
            border: 'none',
            color: 'white',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: analysisType === 'dc' ? 'bold' : 'normal'
          }}
        >
          DC
        </button>
        <button
          onClick={() => setAnalysisType('ac')}
          style={{
            flex: 1,
            padding: '10px',
            background: analysisType === 'ac' ? '#4a9eff' : '#333',
            border: 'none',
            color: 'white',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: analysisType === 'ac' ? 'bold' : 'normal'
          }}
        >
          AC
        </button>
        <button
          onClick={() => setAnalysisType('transient')}
          style={{
            flex: 1,
            padding: '10px',
            background: analysisType === 'transient' ? '#4a9eff' : '#333',
            border: 'none',
            color: 'white',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: analysisType === 'transient' ? 'bold' : 'normal'
          }}
        >
          Transitorio
        </button>
        <button
          onClick={() => setAnalysisType('fft')}
          style={{
            flex: 1,
            padding: '10px',
            background: analysisType === 'fft' ? '#4a9eff' : '#333',
            border: 'none',
            color: 'white',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: analysisType === 'fft' ? 'bold' : 'normal'
          }}
        >
          FFT
        </button>
      </div>

      {/* Options */}
      <div style={{
        flex: 1,
        padding: '16px',
        overflowY: 'auto'
      }}>
        {renderOptions()}
      </div>

      {/* Footer */}
      <div style={{
        padding: '16px',
        backgroundColor: '#2a2a2a',
        borderTop: '1px solid #444',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '12px'
      }}>
        <button
          onClick={onClose}
          style={{
            padding: '10px 20px',
            background: '#555',
            border: 'none',
            color: 'white',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Cancelar
        </button>
        <button
          onClick={handleRunAnalysis}
          disabled={isRunning}
          style={{
            padding: '10px 20px',
            background: isRunning ? '#666' : '#22c55e',
            border: 'none',
            color: 'white',
            borderRadius: '4px',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          {isRunning ? '⏳ Ejecutando...' : '▶️ Ejecutar Análisis'}
        </button>
      </div>
    </div>
  );
};

export default AdvancedAnalysisPanel;
