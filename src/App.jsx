import { useState } from 'react';
import './App.css';
import Toolbar from './components/Toolbar';
import ComponentLibrary from './components/ComponentLibrary';
import CircuitCanvas from './components/CircuitCanvas';
import PropertiesPanel from './components/PropertiesPanel';
import ResultsPanel from './components/ResultsPanel';
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

  // Obtener el componente seleccionado
  const selectedComponent = components.find(c => c.id === selectedComponentId);

  // Agregar un nuevo componente al canvas
  const handleAddComponent = (component) => {
    setComponents([...components, component]);
    setSelectedComponentId(component.id);
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
  };

  // Limpiar el canvas
  const handleClearCanvas = () => {
    if (confirm('¿Estás seguro de que deseas eliminar todos los componentes?')) {
      setComponents([]);
      setConnections([]);
      setSelectedComponentId(null);
      setSimulationResults(null);
    }
  };

  // Iniciar simulación
  const handleStartSimulation = () => {
    if (components.length === 0) {
      alert('Agrega componentes al canvas antes de iniciar la simulación');
      return;
    }
    
    if (connections.length === 0) {
      alert('Conecta los componentes antes de iniciar la simulación');
      return;
    }
    
    // Ejecutar simulación con conexiones
    const result = simulateCircuit(components, connections);
    
    if (result.success) {
      setSimulationResults(result.results);
      setIsSimulating(true);
      console.log('Simulación exitosa:', result.results);
    } else {
      alert(`Error en la simulación: ${result.error}`);
      console.error('Error de simulación:', result.error);
    }
  };

  // Pausar simulación
  const handlePauseSimulation = () => {
    setIsSimulating(false);
  };

  // Reiniciar simulación
  const handleResetSimulation = () => {
    setIsSimulating(false);
    setSimulationResults(null);
  };

  // Guardar proyecto
  const handleSaveProject = () => {
    const projectData = {
      components,
      timestamp: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(projectData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `circuito-${Date.now()}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  // Cargar proyecto
  const handleLoadProject = () => {
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
          setComponents(projectData.components || []);
          setSelectedComponentId(null);
          setSimulationResults(null);
        } catch (error) {
          alert('Error al cargar el archivo. Asegúrate de que sea un archivo válido.');
          console.error(error);
        }
      };
      reader.readAsText(file);
    };
    
    input.click();
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Barra de herramientas superior */}
      <Toolbar
        isSimulating={isSimulating}
        onStartSimulation={handleStartSimulation}
        onPauseSimulation={handlePauseSimulation}
        onResetSimulation={handleResetSimulation}
        onClearCanvas={handleClearCanvas}
        onSaveProject={handleSaveProject}
        onLoadProject={handleLoadProject}
      />

      {/* Área de trabajo principal */}
      <div className="flex-1 flex overflow-hidden">
        {/* Panel izquierdo: Biblioteca de componentes */}
        <div className="w-64 bg-gray-50 p-4 border-r border-gray-200 overflow-y-auto">
          <ComponentLibrary onAddComponent={handleAddComponent} />
        </div>

        {/* Canvas central */}
        <div className="flex-1 p-4">
          <CircuitCanvas
            components={components}
            onComponentsChange={setComponents}
            selectedComponent={selectedComponentId}
            onSelectComponent={setSelectedComponentId}
            connections={connections}
            onConnectionsChange={setConnections}
          />
        </div>

        {/* Panel derecho: Propiedades y Resultados */}
        <div className="w-80 bg-gray-50 p-4 border-l border-gray-200 overflow-y-auto space-y-4">
          <PropertiesPanel
            component={selectedComponent}
            onUpdateComponent={handleUpdateComponent}
            onDeleteComponent={handleDeleteComponent}
          />
          
          <ResultsPanel
            results={simulationResults}
            isSimulating={isSimulating}
          />
        </div>
      </div>

      {/* Barra de estado inferior */}
      <div className="bg-white border-t border-gray-200 px-4 py-2 flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-4">
          <span>Componentes: {components.length}</span>
          {selectedComponent && (
            <span className="text-blue-600">
              • Seleccionado: {selectedComponent.label || selectedComponent.type}
            </span>
          )}
        </div>
        <div className="text-xs text-gray-400">
          v1.0.0 | Simulador de Circuitos Eléctricos
        </div>
      </div>
    </div>
  );
}

export default App;
