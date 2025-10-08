import { useState } from 'react';

/**
 * Multimeter - Multímetro interactivo estilo Tinkercad
 * Permite medir voltaje, corriente y resistencia en el circuito
 */
const Multimeter = ({ simulationResults, components, connections }) => {
  const [mode, setMode] = useState('voltage'); // 'voltage', 'current', 'resistance'
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [measurement, setMeasurement] = useState(null);

  // Modos del multímetro
  const modes = [
    { id: 'voltage', label: 'Voltaje', unit: 'V', icon: '⚡', color: 'blue' },
    { id: 'current', label: 'Corriente', unit: 'A', icon: '🔋', color: 'green' },
    { id: 'resistance', label: 'Resistencia', unit: 'Ω', icon: '📊', color: 'yellow' }
  ];

  // Realizar medición
  const handleMeasure = (componentId) => {
    if (!simulationResults || !simulationResults.componentData) {
      setMeasurement({ value: 0, unit: getUnit(mode), error: 'No hay simulación activa' });
      return;
    }

    const componentData = simulationResults.componentData[componentId];
    if (!componentData) {
      setMeasurement({ value: 0, unit: getUnit(mode), error: 'Componente no encontrado' });
      return;
    }

    let value = 0;
    let unit = getUnit(mode);

    switch (mode) {
      case 'voltage':
        value = Math.abs(componentData.voltage || 0);
        break;
      case 'current':
        value = Math.abs(componentData.current || 0);
        break;
      case 'resistance':
        const component = components.find(c => c.id === componentId);
        if (component && component.type === 'resistor') {
          value = component.value;
        } else {
          value = 0;
          unit = 'Ω (solo resistencias)';
        }
        break;
    }

    setMeasurement({ value, unit, error: null });
    setSelectedComponent(componentId);
  };

  // Obtener unidad según el modo
  const getUnit = (mode) => {
    const modeObj = modes.find(m => m.id === mode);
    return modeObj ? modeObj.unit : '';
  };

  // Formatear valor con decimales apropiados
  const formatValue = (value) => {
    if (value === 0) return '0.000000';
    if (!isFinite(value)) return '∞';
    
    // Formatear con notación científica si es muy pequeño o muy grande
    if (Math.abs(value) < 0.001 || Math.abs(value) > 1000000) {
      return value.toExponential(4);
    }
    
    return value.toFixed(6);
  };

  // Obtener color del modo actual
  const getCurrentMode = () => {
    return modes.find(m => m.id === mode);
  };

  const currentMode = getCurrentMode();

  return (
    <div className="p-4">
      {/* Selector de modo */}
      <div className="mb-4">
        <label className="text-sm font-semibold text-gray-700 block mb-2">
          Modo de Medición
        </label>
        <div className="grid grid-cols-3 gap-2">
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => {
                setMode(m.id);
                setMeasurement(null);
                setSelectedComponent(null);
              }}
              className={`flex flex-col items-center gap-1 py-3 px-2 rounded-lg border-2 transition-all ${
                mode === m.id
                  ? 'bg-blue-600 text-white border-blue-700 shadow-lg'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
              }`}
            >
              <span className="text-2xl">{m.icon}</span>
              <span className="text-xs font-semibold">{m.label}</span>
              <span className="text-xs opacity-80">({m.unit})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Display del multímetro - Pantalla LCD */}
      <div className="mb-4 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border-4 border-gray-700 shadow-inner">
        <div className="bg-green-900 rounded-lg p-4 border-2 border-green-950">
          <div className="text-center">
            {/* Indicador de modo */}
            <div className="text-xs text-green-400 mb-2 font-mono">
              {currentMode.icon} {currentMode.label.toUpperCase()}
            </div>
            
            {/* Valor principal */}
            <div className="text-5xl font-mono font-bold text-green-400 mb-1 tracking-wider">
              {measurement ? formatValue(measurement.value) : '----.----'}
            </div>
            
            {/* Unidad */}
            <div className="text-2xl font-semibold text-green-300 mb-2">
              {measurement ? measurement.unit : currentMode.unit}
            </div>
            
            {/* Error o estado */}
            {measurement && measurement.error && (
              <div className="text-sm text-red-400 mt-2 animate-pulse">
                ⚠️ {measurement.error}
              </div>
            )}
            
            {!measurement && (
              <div className="text-xs text-green-500 opacity-70">
                Selecciona un componente para medir
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Selector de componente */}
      <div className="mb-4">
        <label className="text-sm font-semibold text-gray-700 block mb-2">
          🎯 Seleccionar Componente
        </label>
        <select
          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-800"
          value={selectedComponent || ''}
          onChange={(e) => {
            const componentId = e.target.value;
            if (componentId) {
              handleMeasure(componentId);
            } else {
              setMeasurement(null);
              setSelectedComponent(null);
            }
          }}
        >
          <option value="">-- Selecciona un componente --</option>
          {components
            .filter((c) => c.type !== 'ground')
            .map((component) => {
              const typeNames = {
                voltage_source: '🔴 Fuente de Voltaje',
                current_source: '🔵 Fuente de Corriente',
                resistor: '🟡 Resistencia',
                capacitor: '🟢 Capacitor',
                inductor: '🟣 Inductor',
                led: '🟠 LED',
              };
              const readableId = component.readableId || component.label || component.id.substring(0, 8);
              return (
                <option key={component.id} value={component.id}>
                  {typeNames[component.type] || component.type} - {readableId}
                </option>
              );
            })}
        </select>
      </div>

      {/* Información adicional del componente */}
      {measurement && !measurement.error && selectedComponent && simulationResults && simulationResults.componentData[selectedComponent] && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border-2 border-blue-200 mb-4">
          <div className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
            <span>📋</span>
            <span>Información Completa del Componente</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center bg-white rounded px-3 py-2">
              <span className="font-semibold text-gray-700">⚡ Voltaje:</span>
              <span className="font-mono text-blue-600">
                {formatValue(Math.abs(simulationResults.componentData[selectedComponent].voltage || 0))} V
              </span>
            </div>
            <div className="flex justify-between items-center bg-white rounded px-3 py-2">
              <span className="font-semibold text-gray-700">🔋 Corriente:</span>
              <span className="font-mono text-green-600">
                {formatValue(Math.abs(simulationResults.componentData[selectedComponent].current || 0))} A
              </span>
            </div>
            <div className="flex justify-between items-center bg-white rounded px-3 py-2">
              <span className="font-semibold text-gray-700">⚙️ Potencia:</span>
              <span className="font-mono text-purple-600">
                {formatValue(Math.abs(simulationResults.componentData[selectedComponent].power || 0))} W
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Instrucciones de uso */}
      <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg p-4 border-2 border-yellow-300">
        <div className="text-sm text-yellow-900">
          <div className="font-bold mb-2 flex items-center gap-2">
            <span>💡</span>
            <span>Cómo usar el multímetro:</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-xs">
            <li>Selecciona el <strong>modo de medición</strong> (Voltaje, Corriente o Resistencia)</li>
            <li>Elige el <strong>componente</strong> que deseas medir del menú desplegable</li>
            <li>El multímetro mostrará el <strong>valor medido</strong> en la pantalla LCD</li>
            <li>Revisa la información completa del componente en el panel inferior</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default Multimeter;
