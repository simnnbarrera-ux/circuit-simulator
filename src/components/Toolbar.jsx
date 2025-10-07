import { Button } from '@/components/ui/button.jsx';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Save, 
  FolderOpen,
  Trash2,
  Settings
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
  onLoadProject
}) => {
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
      {/* Logo y título */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">⚡</span>
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-800">Simulador de Circuitos</h1>
          <p className="text-xs text-gray-500">Herramienta educativa interactiva</p>
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
