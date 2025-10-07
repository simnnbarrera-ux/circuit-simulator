import { X } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';

/**
 * AnalysisModal - Modal para mostrar análisis detallado del circuito
 */
const AnalysisModal = ({ isOpen, onClose, simulationResults, components }) => {
  if (!isOpen) return null;

  const { nodeVoltages, componentData } = simulationResults || {};

  // Formatear voltaje con unidades
  const formatVoltage = (voltage) => {
    if (Math.abs(voltage) >= 1000) {
      return `${(voltage / 1000).toFixed(3)} kV`;
    } else if (Math.abs(voltage) >= 1) {
      return `${voltage.toFixed(3)} V`;
    } else {
      return `${(voltage * 1000).toFixed(3)} mV`;
    }
  };

  // Formatear corriente con unidades
  const formatCurrent = (current) => {
    if (Math.abs(current) >= 1) {
      return `${current.toFixed(3)} A`;
    } else if (Math.abs(current) >= 0.001) {
      return `${(current * 1000).toFixed(3)} mA`;
    } else {
      return `${(current * 1000000).toFixed(3)} μA`;
    }
  };

  // Formatear potencia con unidades
  const formatPower = (power) => {
    if (Math.abs(power) >= 1000) {
      return `${(power / 1000).toFixed(3)} kW`;
    } else if (Math.abs(power) >= 1) {
      return `${power.toFixed(3)} W`;
    } else {
      return `${(power * 1000).toFixed(3)} mW`;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Análisis del Circuito</h2>
            <p className="text-sm text-blue-100 mt-1">Valores calculados mediante Análisis Nodal Modificado</p>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            className="text-white hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!simulationResults ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">No hay resultados de simulación disponibles.</p>
              <p className="text-sm mt-2">Inicia la simulación para ver el análisis.</p>
            </div>
          ) : (
            <>
              {/* Voltajes Nodales */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Voltajes Nodales
                </h3>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {Object.entries(nodeVoltages || {}).map(([node, voltage]) => (
                      <div
                        key={node}
                        className="bg-white rounded-lg p-3 border border-blue-200 hover:shadow-md transition-shadow"
                      >
                        <div className="text-xs text-gray-500 font-medium">Nodo {node}</div>
                        <div className="text-lg font-bold text-blue-600 mt-1">
                          {formatVoltage(voltage)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Análisis por Componente */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  Análisis por Componente
                </h3>
                <div className="space-y-3">
                  {componentData?.map((data, index) => {
                    const component = components.find(c => c.id === data.id);
                    const typeNames = {
                      voltage_source: 'Fuente de Voltaje',
                      current_source: 'Fuente de Corriente',
                      resistor: 'Resistencia',
                      capacitor: 'Capacitor',
                      inductor: 'Inductor',
                      led: 'LED',
                      ground: 'Tierra'
                    };

                    return (
                      <div
                        key={data.id || index}
                        className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-bold text-gray-800">
                              {component?.label || typeNames[data.type] || data.type}
                            </h4>
                            <p className="text-xs text-gray-500">
                              {typeNames[data.type]} • ID: {data.id?.substring(0, 8)}...
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            data.type === 'voltage_source' || data.type === 'current_source'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {data.type === 'voltage_source' || data.type === 'current_source' ? 'Fuente' : 'Pasivo'}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          {/* Voltaje */}
                          <div className="bg-white rounded-lg p-3 border border-purple-200">
                            <div className="text-xs text-gray-500 font-medium mb-1">Voltaje</div>
                            <div className="text-base font-bold text-purple-600">
                              {formatVoltage(data.voltage || 0)}
                            </div>
                          </div>

                          {/* Corriente */}
                          <div className="bg-white rounded-lg p-3 border border-purple-200">
                            <div className="text-xs text-gray-500 font-medium mb-1">Corriente</div>
                            <div className="text-base font-bold text-blue-600">
                              {formatCurrent(data.current || 0)}
                            </div>
                          </div>

                          {/* Potencia */}
                          <div className="bg-white rounded-lg p-3 border border-purple-200">
                            <div className="text-xs text-gray-500 font-medium mb-1">Potencia</div>
                            <div className={`text-base font-bold ${
                              (data.power || 0) >= 0 ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {formatPower(Math.abs(data.power || 0))}
                              {(data.power || 0) >= 0 ? ' ↑' : ' ↓'}
                            </div>
                          </div>
                        </div>

                        {/* Nodos del componente */}
                        <div className="mt-3 flex items-center gap-2 text-xs text-gray-600">
                          <span className="font-medium">Nodos:</span>
                          <span className="bg-white px-2 py-1 rounded border border-gray-200">
                            {data.node1} → {data.node2}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Resumen del Circuito */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Resumen del Circuito
                </h3>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-xs text-gray-500 font-medium">Total Componentes</div>
                      <div className="text-2xl font-bold text-green-600">{components.length}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 font-medium">Nodos</div>
                      <div className="text-2xl font-bold text-green-600">
                        {Object.keys(nodeVoltages || {}).length}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 font-medium">Potencia Total</div>
                      <div className="text-2xl font-bold text-green-600">
                        {formatPower(
                          componentData?.reduce((sum, data) => sum + Math.abs(data.power || 0), 0) || 0
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 font-medium">Estado</div>
                      <div className="text-2xl font-bold text-green-600">✓ OK</div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
          <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700 text-white">
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisModal;
