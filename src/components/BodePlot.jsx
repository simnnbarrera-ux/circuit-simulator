import React, { useRef, useEffect } from 'react';

/**
 * Componente para visualizar Diagramas de Bode y otras gráficas profesionales
 * 
 * Características:
 * - Diagrama de Bode (magnitud y fase)
 * - Escala logarítmica en frecuencia
 * - Grilla profesional
 * - Marcadores de frecuencias características
 * - Exportación de datos
 */
const BodePlot = ({ 
  data = [], 
  title = 'Diagrama de Bode',
  showMagnitude = true,
  showPhase = true,
  onClose 
}) => {
  const magnitudeCanvasRef = useRef(null);
  const phaseCanvasRef = useRef(null);

  useEffect(() => {
    if (showMagnitude && magnitudeCanvasRef.current) {
      drawMagnitudePlot();
    }
    if (showPhase && phaseCanvasRef.current) {
      drawPhasePlot();
    }
  }, [data, showMagnitude, showPhase]);

  /**
   * Dibujar gráfica de magnitud
   */
  const drawMagnitudePlot = () => {
    const canvas = magnitudeCanvasRef.current;
    if (!canvas || !data || data.length === 0) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Limpiar
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Márgenes
    const margin = { top: 40, right: 50, bottom: 60, left: 70 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;

    // Rangos de datos
    const freqMin = Math.min(...data.map(d => d.frequency));
    const freqMax = Math.max(...data.map(d => d.frequency));
    const magMin = Math.min(...data.map(d => d.magnitudeDb));
    const magMax = Math.max(...data.map(d => d.magnitudeDb));

    // Escalas
    const freqScale = (freq) => {
      const logMin = Math.log10(freqMin);
      const logMax = Math.log10(freqMax);
      const logFreq = Math.log10(freq);
      return margin.left + ((logFreq - logMin) / (logMax - logMin)) * plotWidth;
    };

    const magScale = (mag) => {
      return margin.top + plotHeight - ((mag - magMin) / (magMax - magMin)) * plotHeight;
    };

    // Dibujar grilla
    drawGrid(ctx, margin, plotWidth, plotHeight, freqMin, freqMax, magMin, magMax, freqScale, magScale, 'dB');

    // Dibujar curva
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    data.forEach((point, index) => {
      const x = freqScale(point.frequency);
      const y = magScale(point.magnitudeDb);

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Marcadores de frecuencias características
    drawFrequencyMarkers(ctx, data, freqScale, magScale, plotHeight, margin);

    // Título
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Magnitud (dB)', width / 2, 25);
  };

  /**
   * Dibujar gráfica de fase
   */
  const drawPhasePlot = () => {
    const canvas = phaseCanvasRef.current;
    if (!canvas || !data || data.length === 0) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Limpiar
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Márgenes
    const margin = { top: 40, right: 50, bottom: 60, left: 70 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;

    // Rangos
    const freqMin = Math.min(...data.map(d => d.frequency));
    const freqMax = Math.max(...data.map(d => d.frequency));
    const phaseMin = Math.min(...data.map(d => d.phaseDegrees));
    const phaseMax = Math.max(...data.map(d => d.phaseDegrees));

    // Escalas
    const freqScale = (freq) => {
      const logMin = Math.log10(freqMin);
      const logMax = Math.log10(freqMax);
      const logFreq = Math.log10(freq);
      return margin.left + ((logFreq - logMin) / (logMax - logMin)) * plotWidth;
    };

    const phaseScale = (phase) => {
      return margin.top + plotHeight - ((phase - phaseMin) / (phaseMax - phaseMin)) * plotHeight;
    };

    // Dibujar grilla
    drawGrid(ctx, margin, plotWidth, plotHeight, freqMin, freqMax, phaseMin, phaseMax, freqScale, phaseScale, '°');

    // Dibujar curva
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    data.forEach((point, index) => {
      const x = freqScale(point.frequency);
      const y = phaseScale(point.phaseDegrees);

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Título
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Fase (grados)', width / 2, 25);
  };

  /**
   * Dibujar grilla
   */
  const drawGrid = (ctx, margin, plotWidth, plotHeight, xMin, xMax, yMin, yMax, xScale, yScale, yUnit) => {
    // Fondo del área de plot
    ctx.fillStyle = '#fafafa';
    ctx.fillRect(margin.left, margin.top, plotWidth, plotHeight);

    // Grilla vertical (frecuencias - logarítmica)
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;

    const logMin = Math.floor(Math.log10(xMin));
    const logMax = Math.ceil(Math.log10(xMax));

    for (let decade = logMin; decade <= logMax; decade++) {
      for (let i = 1; i <= 9; i++) {
        const freq = i * Math.pow(10, decade);
        if (freq >= xMin && freq <= xMax) {
          const x = xScale(freq);
          
          // Línea más gruesa en potencias de 10
          if (i === 1) {
            ctx.strokeStyle = '#d0d0d0';
            ctx.lineWidth = 1.5;
          } else {
            ctx.strokeStyle = '#e8e8e8';
            ctx.lineWidth = 0.5;
          }

          ctx.beginPath();
          ctx.moveTo(x, margin.top);
          ctx.lineTo(x, margin.top + plotHeight);
          ctx.stroke();
        }
      }
    }

    // Grilla horizontal
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;

    const yStep = (yMax - yMin) / 10;
    for (let i = 0; i <= 10; i++) {
      const y = yScale(yMin + i * yStep);
      ctx.beginPath();
      ctx.moveTo(margin.left, y);
      ctx.lineTo(margin.left + plotWidth, y);
      ctx.stroke();
    }

    // Ejes
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;

    // Eje X
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top + plotHeight);
    ctx.lineTo(margin.left + plotWidth, margin.top + plotHeight);
    ctx.stroke();

    // Eje Y
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top);
    ctx.lineTo(margin.left, margin.top + plotHeight);
    ctx.stroke();

    // Etiquetas del eje X (frecuencia)
    ctx.fillStyle = '#000000';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';

    for (let decade = logMin; decade <= logMax; decade++) {
      const freq = Math.pow(10, decade);
      if (freq >= xMin && freq <= xMax) {
        const x = xScale(freq);
        const label = formatFrequency(freq);
        ctx.fillText(label, x, margin.top + plotHeight + 20);
      }
    }

    // Etiqueta del eje X
    ctx.font = 'bold 13px Arial';
    ctx.fillText('Frecuencia (Hz)', margin.left + plotWidth / 2, margin.top + plotHeight + 45);

    // Etiquetas del eje Y
    ctx.font = '12px Arial';
    ctx.textAlign = 'right';

    for (let i = 0; i <= 10; i++) {
      const value = yMin + i * yStep;
      const y = yScale(value);
      ctx.fillText(value.toFixed(1) + yUnit, margin.left - 10, y + 4);
    }
  };

  /**
   * Dibujar marcadores de frecuencias características
   */
  const drawFrequencyMarkers = (ctx, data, freqScale, magScale, plotHeight, margin) => {
    // Encontrar frecuencia de corte (-3dB)
    const maxMag = Math.max(...data.map(d => d.magnitudeDb));
    const cutoffMag = maxMag - 3;

    let cutoffFreq = null;
    for (let i = 1; i < data.length; i++) {
      if (data[i - 1].magnitudeDb >= cutoffMag && data[i].magnitudeDb < cutoffMag) {
        // Interpolación lineal
        const t = (cutoffMag - data[i - 1].magnitudeDb) / (data[i].magnitudeDb - data[i - 1].magnitudeDb);
        cutoffFreq = data[i - 1].frequency + t * (data[i].frequency - data[i - 1].frequency);
        break;
      }
    }

    if (cutoffFreq) {
      const x = freqScale(cutoffFreq);
      const y = magScale(cutoffMag);

      // Línea vertical
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(x, margin.top);
      ctx.lineTo(x, margin.top + plotHeight);
      ctx.stroke();
      ctx.setLineDash([]);

      // Etiqueta
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 11px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`fc = ${formatFrequency(cutoffFreq)}`, x + 5, margin.top + 15);
    }
  };

  /**
   * Formatear frecuencia
   */
  const formatFrequency = (freq) => {
    if (freq >= 1e6) return `${(freq / 1e6).toFixed(1)}M`;
    if (freq >= 1e3) return `${(freq / 1e3).toFixed(1)}k`;
    return `${freq.toFixed(1)}`;
  };

  /**
   * Exportar datos a CSV
   */
  const exportToCSV = () => {
    let csv = 'Frequency (Hz),Magnitude (dB),Phase (degrees)\n';
    data.forEach(point => {
      csv += `${point.frequency},${point.magnitudeDb},${point.phaseDegrees}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bode_plot.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '1000px',
      maxHeight: '90vh',
      backgroundColor: '#ffffff',
      border: '2px solid #ccc',
      borderRadius: '8px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px',
        backgroundColor: '#f5f5f5',
        borderBottom: '1px solid #ddd',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h3 style={{ margin: 0, color: '#333', fontSize: '18px' }}>
          📈 {title}
        </h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={exportToCSV}
            style={{
              background: '#22c55e',
              border: 'none',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '13px'
            }}
          >
            💾 Exportar CSV
          </button>
          <button
            onClick={onClose}
            style={{
              background: '#ef4444',
              border: 'none',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '13px'
            }}
          >
            ✕ Cerrar
          </button>
        </div>
      </div>

      {/* Plots */}
      <div style={{
        flex: 1,
        padding: '20px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        {showMagnitude && (
          <div>
            <canvas
              ref={magnitudeCanvasRef}
              width={940}
              height={350}
              style={{
                width: '100%',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            />
          </div>
        )}

        {showPhase && (
          <div>
            <canvas
              ref={phaseCanvasRef}
              width={940}
              height={350}
              style={{
                width: '100%',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            />
          </div>
        )}

        {data.length === 0 && (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            color: '#999'
          }}>
            No hay datos para mostrar. Ejecuta un análisis AC primero.
          </div>
        )}
      </div>
    </div>
  );
};

export default BodePlot;
