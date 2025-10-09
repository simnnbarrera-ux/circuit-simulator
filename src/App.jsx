import { useState } from 'react';
import './App.css';
import Toolbar from './components/Toolbar';
import ComponentLibrary from './components/ComponentLibrary';
import CircuitCanvas from './components/CircuitCanvas';
import PropertiesPanel from './components/PropertiesPanel';
import ResultsPanel from './components/ResultsPanel';
import AnalysisModal from './components/AnalysisModal';
import Multimeter from './components/Multimeter';
import WelcomeGuide from './components/WelcomeGuide';
import { simulateCircuit } from './lib/circuitSimulator';

/**
 * App - Componente principal del simulador de circuitos
 */
function App() {
  // Estado de los componentes en el canvas
  const [components, setComponents] = useState([]);
  
  // Estado de las conexiones entre componentes
  const [connections, setConnections] = useState([]);
  
  // Componente seleccionado actualmente
  const [selectedComponentId, setSelectedComponentId] = useState(null);
  
  // Estado de la simulación
  const [isSimulating, setIsSimulating] = useState(false);
  
  // Resultados de la simulación
  const [simulationResults, setSimulationResults] = useState(null);

  // Estado del modal de análisis
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);

  // Estado del multímetro flotante
  const [showMultimeter, setShowMultimeter] = useState(false);

  // Estado de la guía de bienvenida
  const [showWelcomeGuide, setShowWelcomeGuide] = useState(false);

  // Contadores para IDs automáticos
  const [componentCounters, setComponentCounters] = useState({
    voltage_source: 0,
    current_source: 0,
    resistor: 0,
    capacitor: 0,
    inductor: 0,
    led: 0,
    ground: 0
  });

  // Obtener el componente seleccionado
  const selectedComponent = components.find(c => c.id === selectedComponentId);

  // Función para generar ID legible (R1, C2, V1, etc.)
  const generateReadableId = (type) => {
    const prefixes = {
      voltage_source: 'V',
      current_source: 'I',
      resistor: 'R',
      capacitor: 'C',
      inductor: 'L',
      led: 'D',
      ground: 'GND'
    };

    const newCount = componentCounters[type] + 1;
    setComponentCounters({
      ...componentCounters,
      [type]: newCount
    });

    return `${prefixes[type]}${newCount}`;
  };

  // Agregar un nuevo componente al canvas
  const handleAddComponent = (component) => {
    const readableId = generateReadableId(component.type);
    const componentWithId = {
      ...component,
      readableId: readableId,
      label: readableId // Usar el ID como etiqueta por defecto
    };
    setComponents([...components, componentWithId]);
    setSelectedComponentId(componentWithId.id);
  };

  // Actualizar un componente existente
  const handleUpdateComponent = (updatedComponent) => {
    setComponents(components.map(c => 
      c.id === updatedComponent.id ? updatedComponent : c
    ));
  };

  // Eliminar un componente
  const handleDeleteComponent = (componentId) => {
    setComponents(components.filter(c => c.id !== componentId));
    if (selectedComponentId === componentId) {
      setSelectedComponentId(null);
    }
    // Eliminar conexiones relacionadas
    setConnections(connections.filter(
      conn => conn.from !== componentId && conn.to !== componentId
    ));
  };

  // Seleccionar un componente
  const handleSelectComponent = (componentId) => {
    setSelectedComponentId(componentId);
  };

  // Iniciar simulación
  const handleStartSimulation = () => {
    try {
      // Validar que haya componentes
      if (components.length === 0) {
        alert('Agrega componentes al circuito antes de iniciar la simulación.');
        return;
      }

      // Validar que haya al menos una tierra
      const hasGround = components.some(c => c.type === 'ground');
      if (!hasGround) {
        alert('El circuito debe tener al menos un componente de tierra (referencia).');
        return;
      }

      // Crear conexiones automáticas basadas en proximidad
      const autoConnections = [];
      const proximityThreshold = 150;

      for (let i = 0; i < components.length; i++) {
        for (let j = i + 1; j < components.length; j++) {
          const comp1 = components[i];
          const comp2 = components[j];
          const distance = Math.sqrt(
            Math.pow(comp1.x - comp2.x, 2) + Math.pow(comp1.y - comp2.y, 2)
          );

          if (distance < proximityThreshold) {
            autoConnections.push({
              from: comp1.id,
              to: comp2.id,
              fromTerminal: 1,
              toTerminal: 0
            });
          }
        }
      }

      setConnections(autoConnections);
      console.log('Conexiones automáticas creadas:', autoConnections);

      // Ejecutar simulación
      const simulationOutput = simulateCircuit(components, autoConnections);
      console.log('Resultados de simulación:', simulationOutput);
      
      // Guardar resultados completos incluyendo nodeMap
      setSimulationResults(simulationOutput);
      setIsSimulating(true);
      setShowMultimeter(true); // Mostrar multímetro automáticamente
    } catch (error) {
      console.error('Error en la simulación:', error);
      alert(`Error en la simulación: ${error.message}`);
    }
  };

  // Pausar simulación
  const handlePauseSimulation = () => {
    setIsSimulating(false);
    setShowMultimeter(false);
  };

  // Reiniciar simulación
  const handleResetSimulation = () => {
    setIsSimulating(false);
    setSimulationResults(null);
    setConnections([]);
    setShowMultimeter(false);
  };

  // Limpiar canvas
  const handleClearCanvas = () => {
    setComponents([]);
    setConnections([]);
    setSelectedComponentId(null);
    setIsSimulating(false);
    setSimulationResults(null);
    setShowMultimeter(false);
    // Reiniciar contadores
    setComponentCounters({
      voltage_source: 0,
      current_source: 0,
      resistor: 0,
      capacitor: 0,
      inductor: 0,
      led: 0,
      ground: 0
    });
  };

  // Conectar componentes manualmente (funcionalidad removida)
  const handleConnectComponents = () => {
    // Funcionalidad deshabilitada - las conexiones se hacen por drag and drop
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Toolbar superior */}
      <Toolbar
        isSimulating={isSimulating}
        onStartSimulation={handleStartSimulation}
        onPauseSimulation={handlePauseSimulation}
        onResetSimulation={handleResetSimulation}
        onClearCanvas={handleClearCanvas}
        onViewAnalysis={() => setShowAnalysisModal(true)}
        onToggleMultimeter={() => setShowMultimeter(!showMultimeter)}
        showMultimeter={showMultimeter}
      />

      {/* Contenedor principal */}
      <div className="flex-1 flex overflow-hidden">
        {/* Panel izquierdo - Biblioteca de componentes */}
        <div className="w-64 border-r border-gray-200 bg-white overflow-y-auto">
          <ComponentLibrary onAddComponent={handleAddComponent} />
        </div>

        {/* Canvas central */}
        <div className="flex-1 relative">
          <CircuitCanvas
            components={components}
            connections={connections}
            selectedComponentId={selectedComponentId}
            onSelectComponent={handleSelectComponent}
            onUpdateComponent={handleUpdateComponent}
            onAddConnection={(conn) => setConnections([...connections, conn])}
            isSimulating={isSimulating}
            simulationResults={simulationResults}
          />
        </div>

        {/* Panel derecho - Propiedades y Resultados */}
        <div className="w-80 border-l border-gray-200 bg-white overflow-y-auto">
          <PropertiesPanel
            selectedComponent={selectedComponent}
            onUpdateComponent={handleUpdateComponent}
            onDeleteComponent={handleDeleteComponent}
          />
          
          <ResultsPanel
            results={simulationResults?.results || simulationResults}
            isSimulating={isSimulating}
          />
        </div>
      </div>

      {/* Multímetro flotante */}
      {showMultimeter && isSimulating && (
        <div className="fixed bottom-4 right-4 z-50 bg-white rounded-lg shadow-2xl border-2 border-gray-300 w-96">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-t-lg flex items-center justify-between">
            <h3 className="font-bold">🔬 Multímetro Digital</h3>
            <button
              onClick={() => setShowMultimeter(false)}
              className="text-white hover:text-gray-200 font-bold text-xl"
            >
              ×
            </button>
          </div>
          <Multimeter
            simulationResults={simulationResults?.results || simulationResults}
            components={components}
            connections={connections}
          />
        </div>
      )}

      {/* Modal de análisis */}
      {showAnalysisModal && (
        <AnalysisModal
          results={simulationResults?.results || simulationResults}
          onClose={() => setShowAnalysisModal(false)}
        />
      )}

      {/* Barra de estado inferior */}
      <div className="bg-white border-t border-gray-200 px-4 py-2 flex items-center justify-between text-sm text-gray-600">
        <div>
          Componentes: {components.length} {selectedComponent && `• Seleccionado: ${selectedComponent.readableId || selectedComponent.label}`}
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowWelcomeGuide(true)}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
          >
            <span>❓</span>
            <span>Ayuda</span>
          </button>
          <div className="text-xs text-gray-400">
            v1.0.0 | SibaruCircuits
          </div>
        </div>
      </div>

      {/* Guía de bienvenida */}
      {showWelcomeGuide && (
        <WelcomeGuide onClose={() => setShowWelcomeGuide(false)} />
      )}
    </div>
  );
}

export default App;
