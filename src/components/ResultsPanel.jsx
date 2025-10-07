import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Zap, Activity, Power } from 'lucide-react';

/**
 * ResultsPanel - Panel de resultados de la simulación
 * Muestra voltajes, corrientes y potencias calculadas
 */
const ResultsPanel = ({ results, isSimulating }) => {
  if (!results) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Resultados de Simulación
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 text-center py-8">
            {isSimulating 
              ? 'Simulando circuito...' 
              : 'Inicia la simulación para ver los resultados'}
          </p>
        </CardContent>
      </Card>
    );
  }

  const { componentData, nodeVoltages } = results;

  return (
    <Card className="h-full overflow-y-auto">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="w-5 h-5 text-green-600" />
          Resultados de Simulación
          {isSimulating && (
            <Badge variant="outline" className="ml-auto bg-green-50 text-green-700 border-green-200">
              Activo
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Voltajes nodales */}
        <div>
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-600" />
            Voltajes Nodales
          </h3>
          <div className="space-y-1">
            {Object.entries(nodeVoltages).map(([node, voltage]) => (
              <div 
                key={node} 
                className="flex justify-between items-center text-sm bg-blue-50 px-3 py-2 rounded"
              >
                <span className="font-medium text-blue-900">
                  Nodo {node}:
                </span>
                <span className="font-mono text-blue-700">
                  {formatValue(voltage, 'V')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Datos de componentes */}
        <div>
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Power className="w-4 h-4 text-purple-600" />
            Componentes
          </h3>
          <div className="space-y-2">
            {componentData.map((data) => (
              <ComponentResultCard key={data.id} data={data} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Tarjeta de resultados para un componente individual
 */
const ComponentResultCard = ({ data }) => {
  const { type, voltage, current, power } = data;

  const getComponentIcon = (type) => {
    const colors = {
      voltage_source: 'text-red-600',
      current_source: 'text-blue-600',
      resistor: 'text-yellow-600',
      capacitor: 'text-green-600',
      inductor: 'text-purple-600',
      led: 'text-orange-600'
    };
    return colors[type] || 'text-gray-600';
  };

  const getComponentName = (type) => {
    const names = {
      voltage_source: 'Fuente V',
      current_source: 'Fuente I',
      resistor: 'Resistencia',
      capacitor: 'Capacitor',
      inductor: 'Inductor',
      led: 'LED',
      ground: 'Tierra'
    };
    return names[type] || type;
  };

  return (
    <div className="border border-gray-200 rounded-lg p-3 bg-white hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <span className={`text-xs font-semibold ${getComponentIcon(type)}`}>
          {getComponentName(type)}
        </span>
        <span className="text-xs text-gray-400 font-mono">
          {data.id.split('-')[0]}
        </span>
      </div>
      
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="bg-blue-50 px-2 py-1 rounded">
          <div className="text-blue-600 font-medium">Voltaje</div>
          <div className="font-mono text-blue-900">
            {formatValue(voltage, 'V')}
          </div>
        </div>
        
        <div className="bg-green-50 px-2 py-1 rounded">
          <div className="text-green-600 font-medium">Corriente</div>
          <div className="font-mono text-green-900">
            {formatValue(current, 'A')}
          </div>
        </div>
        
        <div className="bg-purple-50 px-2 py-1 rounded">
          <div className="text-purple-600 font-medium">Potencia</div>
          <div className="font-mono text-purple-900">
            {formatValue(power, 'W')}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Formatea valores con prefijos métricos
 */
const formatValue = (value, unit) => {
  if (value === 0) return `0 ${unit}`;
  if (!isFinite(value)) return `∞ ${unit}`;
  
  const absValue = Math.abs(value);
  
  const prefixes = [
    { factor: 1e9, symbol: 'G' },
    { factor: 1e6, symbol: 'M' },
    { factor: 1e3, symbol: 'k' },
    { factor: 1, symbol: '' },
    { factor: 1e-3, symbol: 'm' },
    { factor: 1e-6, symbol: 'μ' },
    { factor: 1e-9, symbol: 'n' },
    { factor: 1e-12, symbol: 'p' }
  ];

  for (const prefix of prefixes) {
    if (absValue >= prefix.factor) {
      const scaledValue = value / prefix.factor;
      return `${scaledValue.toFixed(3)} ${prefix.symbol}${unit}`;
    }
  }

  return `${value.toExponential(2)} ${unit}`;
};

export default ResultsPanel;
