import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Gauge, Zap, Activity } from 'lucide-react';

/**
 * Multimeter - Multímetro interactivo estilo Tinkercad
 * Permite medir voltaje, corriente y resistencia en el circuito
 */
const Multimeter = ({ simulationResults, components, connections, onMeasure }) => {
  const [mode, setMode] = useState('voltage'); // 'voltage', 'current', 'resistance'
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [measurement, setMeasurement] = useState(null);

  // Modos del multímetro
  const modes = [
    { id: 'voltage', label: 'Voltaje (V)', icon: Zap, color: 'blue' },
    { id: 'current', label: 'Corriente (A)', icon: Activity, color: 'green' },
    { id: 'resistance', label: 'Resistencia (Ω)', icon: Gauge, color: 'yellow' }
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

    if (onMeasure) {
      onMeasure({ componentId, mode, value });
    }
  };

  // Obtener unidad según el modo
  const getUnit = (mode) => {
    switch (mode) {
      case 'voltage': return 'V';
      case 'current': return 'A';
      case 'resistance': return 'Ω';
      default: return '';
    }
  };

  // Formatear valor con 6 decimales
  const formatValue = (value) => {
    if (value === 0) return '0.000000';
    if (!isFinite(value)) return '∞';
    return value.toFixed(6);
  };

  // Obtener color del modo actual
  const getCurrentModeColor = () => {
    const currentMode = modes.find(m => m.id === mode);
    return currentMode ? currentMode.color : 'gray';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Gauge className="w-5 h-5 text-red-600" />
          Multímetro Digital
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selector de modo */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">
            Modo de Medición
          </label>
          <div className="grid grid-cols-3 gap-2">
            {modes.map((m) => {
              const Icon = m.icon;
              return (
                <Button
                  key={m.id}
                  onClick={() => {
                    setMode(m.id);
                    setMeasurement(null);
                    setSelectedComponent(null);
                  }}
                  variant={mode === m.id ? 'default' : 'outline'}
                  className={`flex flex-col items-center gap-1 h-auto py-2 ${
                    mode === m.id
                      ? `bg-${m.color}-600 hover:bg-${m.color}-700 text-white`
                      : ''
                  }`}
                  style={
                    mode === m.id
                      ? {
                          backgroundColor:
                            m.color === 'blue'
                              ? '#2563eb'
                              : m.color === 'green'
                              ? '#16a34a'
                              : '#eab308',
                        }
                      : {}
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-xs">{m.label}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Display del multímetro */}
        <div
          className={`bg-gray-900 rounded-lg p-6 border-4 border-${getCurrentModeColor()}-500`}
          style={{
            borderColor:
              getCurrentModeColor() === 'blue'
                ? '#3b82f6'
                : getCurrentModeColor() === 'green'
                ? '#22c55e'
                : '#facc15',
          }}
        >
          <div className="text-center">
            <div className="text-5xl font-mono font-bold text-green-400 mb-2">
              {measurement ? formatValue(measurement.value) : '---'}
            </div>
            <div className="text-xl font-semibold text-green-300">
              {measurement ? measurement.unit : getUnit(mode)}
            </div>
            {measurement && measurement.error && (
              <div className="text-sm text-red-400 mt-2">{measurement.error}</div>
            )}
          </div>
        </div>

        {/* Selector de componente */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">
            Seleccionar Componente
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedComponent || ''}
            onChange={(e) => {
              const componentId = e.target.value;
              if (componentId) {
                handleMeasure(componentId);
              }
            }}
          >
            <option value="">-- Selecciona un componente --</option>
            {components
              .filter((c) => c.type !== 'ground')
              .map((component) => {
                const typeNames = {
                  voltage_source: 'Fuente V',
                  current_source: 'Fuente I',
                  resistor: 'Resistencia',
                  capacitor: 'Capacitor',
                  inductor: 'Inductor',
                  led: 'LED',
                };
                return (
                  <option key={component.id} value={component.id}>
                    {component.label || typeNames[component.type] || component.type} (
                    {component.id.substring(0, 8)}...)
                  </option>
                );
              })}
          </select>
        </div>

        {/* Información adicional */}
        {measurement && !measurement.error && selectedComponent && (
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <div className="text-xs font-medium text-blue-900 mb-2">
              Información del Componente
            </div>
            <div className="text-xs text-blue-700 space-y-1">
              {simulationResults && simulationResults.componentData[selectedComponent] && (
                <>
                  <div>
                    <span className="font-semibold">Voltaje:</span>{' '}
                    {formatValue(
                      Math.abs(
                        simulationResults.componentData[selectedComponent].voltage || 0
                      )
                    )}{' '}
                    V
                  </div>
                  <div>
                    <span className="font-semibold">Corriente:</span>{' '}
                    {formatValue(
                      Math.abs(
                        simulationResults.componentData[selectedComponent].current || 0
                      )
                    )}{' '}
                    A
                  </div>
                  <div>
                    <span className="font-semibold">Potencia:</span>{' '}
                    {formatValue(
                      Math.abs(
                        simulationResults.componentData[selectedComponent].power || 0
                      )
                    )}{' '}
                    W
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Instrucciones */}
        <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
          <div className="text-xs text-yellow-800">
            <strong>Cómo usar:</strong>
            <ol className="list-decimal list-inside mt-1 space-y-1">
              <li>Selecciona el modo de medición (V, A, Ω)</li>
              <li>Elige el componente que deseas medir</li>
              <li>El multímetro mostrará el valor medido</li>
            </ol>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Multimeter;
