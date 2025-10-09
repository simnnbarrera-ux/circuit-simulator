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

      // Validar que haya conexiones
      if (connections.length === 0) {
        alert('Conecta los componentes antes de iniciar la simulación.');
        return;
      }

      console.log('Iniciando simulación con conexiones:', connections);

      // Ejecutar simulación con las conexiones manuales existentes
      const simulationOutput = simulateCircuit(components, connections);
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

  // Guardar proyecto
  const handleSaveProject = () => {
    try {
      const projectData = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        components: components,
        connections: connections,
        componentCounters: componentCounters
      };

      const dataStr = JSON.stringify(projectData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `circuito_${new Date().getTime()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      alert('Proyecto guardado exitosamente');
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('Error al guardar el proyecto');
    }
  };

  // Cargar proyecto
  const handleLoadProject = () => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const projectData = JSON.parse(event.target.result);
            
            // Validar estructura básica
            if (!projectData.components || !projectData.connections) {
              throw new Error('Archivo de proyecto inválido');
            }

            // Cargar datos
            setComponents(projectData.components || []);
            setConnections(projectData.connections || []);
            setComponentCounters(projectData.componentCounters || {
              voltage_source: 0,
              current_source: 0,
              resistor: 0,
              capacitor: 0,
              inductor: 0,
              led: 0,
              ground: 0
            });
            
            // Resetear estado de simulación
            setIsSimulating(false);
            setSimulationResults(null);
            setSelectedComponentId(null);
            setShowMultimeter(false);

            alert('Proyecto cargado exitosamente');
          } catch (error) {
            console.error('Error al parsear archivo:', error);
            alert('Error al cargar el proyecto: archivo inválido');
          }
        };
        
        reader.readAsText(file);
      };
      
      input.click();
    } catch (error) {
      console.error('Error al cargar:', error);
      alert('Error al cargar el proyecto');
    }
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
        onSaveProject={handleSaveProject}
        onLoadProject={handleLoadProject}
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
            onComponentsChange={setComponents}
            connections={connections}
            onConnectionsChange={setConnections}
            selectedComponent={selectedComponentId}
            onSelectComponent={setSelectedComponentId}
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
            components={components}
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
          components={components}
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
