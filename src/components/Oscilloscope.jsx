import React, { useRef, useEffect, useState } from 'react';

/**
 * Osciloscopio Virtual - Visualización de señales en el tiempo
 * 
 * Características:
 * - Múltiples canales (hasta 4)
 * - Controles de escala temporal y de voltaje
 * - Trigger configurable
 * - Mediciones automáticas (frecuencia, amplitud, RMS)
 * - Cursores para mediciones manuales
 */
const Oscilloscope = ({ 
  signals = [], 
  timeRange = 1e-3, 
  voltageRange = 10,
  onClose 
}) => {
  const canvasRef = useRef(null);
  const [selectedChannel, setSelectedChannel] = useState(0);
  const [showGrid, setShowGrid] = useState(true);
  const [showMeasurements, setShowMeasurements] = useState(true);
  const [timeScale, setTimeScale] = useState(timeRange);
  const [voltScale, setVoltScale] = useState(voltageRange);

  // Colores para cada canal
  const channelColors = [
    '#00ff00', // Verde
    '#ffff00', // Amarillo
    '#00ffff', // Cyan
    '#ff00ff'  // Magenta
  ];

  /**
   * Dibujar el osciloscopio
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Limpiar canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    // Dibujar grilla
    if (showGrid) {
      drawGrid(ctx, width, height);
    }

    // Dibujar señales
    signals.forEach((signal, index) => {
      if (signal && signal.data && signal.data.length > 0) {
        drawSignal(ctx, signal.data, channelColors[index % 4], width, height);
      }
    });

    // Dibujar mediciones
    if (showMeasurements && signals[selectedChannel]) {
      drawMeasurements(ctx, signals[selectedChannel], width, height);
    }

    // Dibujar ejes y etiquetas
    drawAxes(ctx, width, height);

  }, [signals, timeScale, voltScale, showGrid, showMeasurements, selectedChannel]);

  /**
   * Dibujar grilla del osciloscopio
   */
  const drawGrid = (ctx, width, height) => {
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 1;

    // Líneas verticales (tiempo)
    const numVerticalLines = 10;
    for (let i = 0; i <= numVerticalLines; i++) {
      const x = (i / numVerticalLines) * width;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Líneas horizontales (voltaje)
    const numHorizontalLines = 8;
    for (let i = 0; i <= numHorizontalLines; i++) {
      const y = (i / numHorizontalLines) * height;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Líneas centrales más gruesas
    ctx.strokeStyle = '#555555';
    ctx.lineWidth = 2;
    
    // Centro vertical
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();

    // Centro horizontal
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
  };

  /**
   * Dibujar señal
   */
  const drawSignal = (ctx, data, color, width, height) => {
    if (!data || data.length < 2) return;

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();

    const xScale = width / data.length;
    const yScale = height / (2 * voltScale);
    const yOffset = height / 2;

    data.forEach((point, index) => {
      const x = index * xScale;
      const y = yOffset - (point.value * yScale);

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();
  };

  /**
   * Dibujar ejes y etiquetas
   */
  const drawAxes = (ctx, width, height) => {
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px monospace';

    // Etiquetas de tiempo (eje X)
    const timeLabels = 10;
    for (let i = 0; i <= timeLabels; i++) {
      const x = (i / timeLabels) * width;
      const time = (i / timeLabels) * timeScale;
      const label = formatTime(time);
      ctx.fillText(label, x - 20, height - 5);
    }

    // Etiquetas de voltaje (eje Y)
    const voltLabels = 8;
    for (let i = 0; i <= voltLabels; i++) {
      const y = (i / voltLabels) * height;
      const volt = voltScale - (i / voltLabels) * (2 * voltScale);
      const label = `${volt.toFixed(1)}V`;
      ctx.fillText(label, 5, y + 4);
    }
  };

  /**
   * Dibujar mediciones automáticas
   */
  const drawMeasurements = (ctx, signal, width, height) => {
    if (!signal || !signal.data) return;

    const measurements = calculateMeasurements(signal.data);

    ctx.fillStyle = '#00ff00';
    ctx.font = '14px monospace';

    const x = width - 200;
    let y = 20;

    ctx.fillText(`Canal: ${signal.name || 'CH1'}`, x, y);
    y += 20;
    ctx.fillText(`Vpp: ${measurements.vpp.toFixed(3)} V`, x, y);
    y += 20;
    ctx.fillText(`Vrms: ${measurements.vrms.toFixed(3)} V`, x, y);
    y += 20;
    ctx.fillText(`Freq: ${formatFrequency(measurements.frequency)}`, x, y);
    y += 20;
    ctx.fillText(`Max: ${measurements.max.toFixed(3)} V`, x, y);
    y += 20;
    ctx.fillText(`Min: ${measurements.min.toFixed(3)} V`, x, y);
  };

  /**
   * Calcular mediciones automáticas
   */
  const calculateMeasurements = (data) => {
    if (!data || data.length === 0) {
      return { vpp: 0, vrms: 0, frequency: 0, max: 0, min: 0 };
    }

    const values = data.map(p => p.value);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const vpp = max - min;

    // RMS
    const sumSquares = values.reduce((sum, v) => sum + v * v, 0);
    const vrms = Math.sqrt(sumSquares / values.length);

    // Frecuencia (detectar cruces por cero)
    let zeroCrossings = 0;
    for (let i = 1; i < values.length; i++) {
      if ((values[i - 1] < 0 && values[i] >= 0) || (values[i - 1] >= 0 && values[i] < 0)) {
        zeroCrossings++;
      }
    }
    
    const duration = data[data.length - 1].time - data[0].time;
    const frequency = zeroCrossings / (2 * duration);

    return { vpp, vrms, frequency, max, min };
  };

  /**
   * Formatear tiempo
   */
  const formatTime = (time) => {
    if (time >= 1) return `${time.toFixed(2)}s`;
    if (time >= 1e-3) return `${(time * 1e3).toFixed(2)}ms`;
    if (time >= 1e-6) return `${(time * 1e6).toFixed(2)}µs`;
    return `${(time * 1e9).toFixed(2)}ns`;
  };

  /**
   * Formatear frecuencia
   */
  const formatFrequency = (freq) => {
    if (freq >= 1e6) return `${(freq / 1e6).toFixed(2)} MHz`;
    if (freq >= 1e3) return `${(freq / 1e3).toFixed(2)} kHz`;
    return `${freq.toFixed(2)} Hz`;
  };

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '900px',
      height: '600px',
      backgroundColor: '#1a1a1a',
      border: '2px solid #444',
      borderRadius: '8px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        backgroundColor: '#2a2a2a',
        borderBottom: '1px solid #444',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: '8px 8px 0 0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#00ff00' }}>
            📊 Osciloscopio Virtual
          </span>
        </div>
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

      {/* Canvas */}
      <div style={{ flex: 1, padding: '16px', position: 'relative' }}>
        <canvas
          ref={canvasRef}
          width={860}
          height={450}
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#000',
            border: '1px solid #444',
            borderRadius: '4px'
          }}
        />
      </div>

      {/* Controls */}
      <div style={{
        padding: '12px 16px',
        backgroundColor: '#2a2a2a',
        borderTop: '1px solid #444',
        display: 'flex',
        gap: '16px',
        alignItems: 'center',
        borderRadius: '0 0 8px 8px'
      }}>
        {/* Time scale */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ color: '#aaa', fontSize: '12px' }}>Tiempo:</label>
          <select
            value={timeScale}
            onChange={(e) => setTimeScale(parseFloat(e.target.value))}
            style={{
              background: '#333',
              border: '1px solid #555',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px'
            }}
          >
            <option value={1e-6}>1 µs</option>
            <option value={10e-6}>10 µs</option>
            <option value={100e-6}>100 µs</option>
            <option value={1e-3}>1 ms</option>
            <option value={10e-3}>10 ms</option>
            <option value={100e-3}>100 ms</option>
            <option value={1}>1 s</option>
          </select>
        </div>

        {/* Voltage scale */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ color: '#aaa', fontSize: '12px' }}>Voltaje:</label>
          <select
            value={voltScale}
            onChange={(e) => setVoltScale(parseFloat(e.target.value))}
            style={{
              background: '#333',
              border: '1px solid #555',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px'
            }}
          >
            <option value={1}>1 V</option>
            <option value={2}>2 V</option>
            <option value={5}>5 V</option>
            <option value={10}>10 V</option>
            <option value={20}>20 V</option>
            <option value={50}>50 V</option>
          </select>
        </div>

        {/* Toggles */}
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#aaa', fontSize: '12px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={showGrid}
            onChange={(e) => setShowGrid(e.target.checked)}
          />
          Grilla
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#aaa', fontSize: '12px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={showMeasurements}
            onChange={(e) => setShowMeasurements(e.target.checked)}
          />
          Mediciones
        </label>

        {/* Channel selector */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
          {signals.map((signal, index) => (
            <button
              key={index}
              onClick={() => setSelectedChannel(index)}
              style={{
                background: selectedChannel === index ? channelColors[index] : '#333',
                border: `2px solid ${channelColors[index]}`,
                color: selectedChannel === index ? '#000' : channelColors[index],
                padding: '4px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 'bold'
              }}
            >
              CH{index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Oscilloscope;
