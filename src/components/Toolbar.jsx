import { Button } from '@/components/ui/button.jsx';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Save, 
  FolderOpen,
  Trash2,
  Settings,
  BarChart3,
  Link2
} from 'lucide-react';

/**
 * Toolbar - Barra de herramientas con controles principales
 */
const Toolbar = ({ 
  isSimulating, 
  onStartSimulation, 
  onPauseSimulation, 
  onResetSimulation,
  onClearCanvas,
  onSaveProject,
  onLoadProject,
  onViewAnalysis,
  isConnectionMode,
  onToggleConnectionMode
}) => {
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
      {/* Logo y título */}
      <div className="flex items-center gap-3">
        <img src="/logo.png" alt="SibaruCircuits" className="w-10 h-10 object-contain" />
        <div>
          <h1 className="text-lg font-bold text-gray-800">SibaruCircuits</h1>
          <p className="text-xs text-gray-500">Simulador de circuitos eléctricos</p>
        </div>
      </div>

      {/* Controles de simulación */}
      <div className="flex items-center gap-2">
        {!isSimulating ? (
          <Button
            onClick={onStartSimulation}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Play className="w-4 h-4 mr-2" />
            Iniciar Simulación
          </Button>
        ) : (
          <Button
            onClick={onPauseSimulation}
            className="bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            <Pause className="w-4 h-4 mr-2" />
            Pausar
          </Button>
        )}

        <Button
          onClick={onResetSimulation}
          variant="outline"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reiniciar
        </Button>

        <Button
          onClick={onToggleConnectionMode}
          className={isConnectionMode 
            ? "bg-blue-600 hover:bg-blue-700 text-white" 
            : "bg-gray-100 hover:bg-gray-200 text-gray-700"}
        >
          <Link2 className="w-4 h-4 mr-2" />
          {isConnectionMode ? 'Modo Conexión: ON' : 'Conectar Componentes'}
        </Button>

        {isSimulating && (
          <Button
            onClick={onViewAnalysis}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Ver Valores del Circuito
          </Button>
        )}

        <div className="w-px h-8 bg-gray-300 mx-2" />

        {/* Controles de proyecto */}
        <Button
          onClick={onSaveProject}
          variant="outline"
        >
          <Save className="w-4 h-4 mr-2" />
          Guardar
        </Button>

        <Button
          onClick={onLoadProject}
          variant="outline"
        >
          <FolderOpen className="w-4 h-4 mr-2" />
          Cargar
        </Button>

        <Button
          onClick={onClearCanvas}
          variant="outline"
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Limpiar
        </Button>
      </div>

      {/* Estado de simulación */}
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isSimulating ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
        <span className="text-sm text-gray-600">
          {isSimulating ? 'Simulando...' : 'Detenido'}
        </span>
      </div>
    </div>
  );
};

export default Toolbar;
