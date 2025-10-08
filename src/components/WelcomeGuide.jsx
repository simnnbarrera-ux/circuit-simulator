import { useState } from 'react';

/**
 * WelcomeGuide - Guía de bienvenida para nuevos usuarios
 * Muestra instrucciones paso a paso sobre cómo usar el simulador
 */
const WelcomeGuide = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: '¡Bienvenido a SibaruCircuits! 🎉',
      icon: '👋',
      content: (
        <div className="space-y-3">
          <p className="text-gray-700">
            SibaruCircuits es un simulador de circuitos eléctricos moderno y fácil de usar.
            Te permite diseñar, simular y analizar circuitos de forma interactiva.
          </p>
          <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
            <p className="text-sm text-blue-900 font-semibold">
              Esta guía rápida te mostrará cómo empezar en solo 5 pasos.
            </p>
          </div>
        </div>
      )
    },
    {
      title: 'Paso 1: Agregar Componentes',
      icon: '🔧',
      content: (
        <div className="space-y-3">
          <p className="text-gray-700">
            En el <strong>panel izquierdo</strong> encontrarás la biblioteca de componentes disponibles:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 ml-4">
            <li><span className="font-semibold text-red-600">Fuentes de Voltaje</span> - Suministran voltaje al circuito</li>
            <li><span className="font-semibold text-blue-600">Fuentes de Corriente</span> - Suministran corriente constante</li>
            <li><span className="font-semibold text-yellow-600">Resistencias</span> - Limitan el flujo de corriente</li>
            <li><span className="font-semibold text-green-600">Capacitores</span> - Almacenan energía eléctrica</li>
            <li><span className="font-semibold text-purple-600">Inductores</span> - Almacenan energía magnética</li>
            <li><span className="font-semibold text-orange-600">LEDs</span> - Diodos emisores de luz</li>
            <li><span className="font-semibold text-red-600">Tierra (GND)</span> - Referencia de voltaje (obligatorio)</li>
          </ul>
          <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-300">
            <p className="text-xs text-yellow-900">
              💡 <strong>Tip:</strong> Haz clic en un componente para agregarlo al canvas central.
            </p>
          </div>
        </div>
      )
    },
    {
      title: 'Paso 2: Posicionar y Editar',
      icon: '✏️',
      content: (
        <div className="space-y-3">
          <p className="text-gray-700">
            Una vez agregados los componentes al canvas:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 ml-4">
            <li><strong>Arrastra</strong> los componentes para posicionarlos donde quieras</li>
            <li><strong>Haz clic</strong> en un componente para seleccionarlo</li>
            <li>Usa el <strong>panel derecho</strong> para editar sus propiedades (valor, etiqueta, etc.)</li>
            <li>Cada componente tiene un <strong>ID único</strong> (R1, V1, C1, etc.)</li>
          </ul>
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-300">
            <p className="text-xs text-blue-900">
              💡 <strong>Tip:</strong> Los valores se muestran sobre cada componente en el canvas.
            </p>
          </div>
        </div>
      )
    },
    {
      title: 'Paso 3: Conectar Componentes',
      icon: '🔌',
      content: (
        <div className="space-y-3">
          <p className="text-gray-700">
            Tienes <strong>dos formas</strong> de conectar componentes:
          </p>
          <div className="space-y-3">
            <div className="bg-purple-50 rounded-lg p-3 border-2 border-purple-300">
              <p className="font-semibold text-purple-900 mb-2">🤖 Conexión Automática (por proximidad)</p>
              <p className="text-sm text-purple-800">
                Simplemente posiciona los componentes cerca uno del otro. Al iniciar la simulación,
                se crearán conexiones automáticamente entre componentes cercanos.
              </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 border-2 border-blue-300">
              <p className="font-semibold text-blue-900 mb-2">✋ Conexión Manual (estilo Tinkercad)</p>
              <p className="text-sm text-blue-800 mb-2">
                Haz clic en el botón <strong>"Conectar Componentes"</strong> en la barra superior:
              </p>
              <ol className="list-decimal list-inside text-xs text-blue-800 ml-2 space-y-1">
                <li>Activa el modo de conexión manual</li>
                <li>Haz clic en un terminal de un componente</li>
                <li>Haz clic en el terminal del otro componente</li>
                <li>¡Listo! La conexión se crea automáticamente</li>
              </ol>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Paso 4: Simular el Circuito',
      icon: '⚡',
      content: (
        <div className="space-y-3">
          <p className="text-gray-700">
            Cuando tu circuito esté listo:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 ml-4">
            <li>Asegúrate de tener al menos <strong>un componente de tierra (GND)</strong></li>
            <li>Haz clic en el botón verde <strong>"Iniciar Simulación"</strong></li>
            <li>El simulador calculará voltajes, corrientes y potencias</li>
            <li>Los resultados aparecerán en el panel derecho</li>
          </ol>
          <div className="bg-green-50 rounded-lg p-3 border border-green-300 mt-3">
            <p className="text-xs text-green-900 mb-2">
              <strong>Durante la simulación verás:</strong>
            </p>
            <ul className="list-disc list-inside text-xs text-green-800 ml-2 space-y-1">
              <li><strong>Números de nodos</strong> (N0, N1, N2...) en el canvas</li>
              <li><strong>Multímetro digital</strong> flotante para mediciones</li>
              <li><strong>Valores calculados</strong> en el panel de resultados</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: 'Paso 5: Analizar Resultados',
      icon: '📊',
      content: (
        <div className="space-y-3">
          <p className="text-gray-700">
            Después de la simulación, puedes:
          </p>
          <div className="space-y-3">
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-300">
              <p className="font-semibold text-blue-900 mb-1">🔬 Usar el Multímetro</p>
              <p className="text-xs text-blue-800">
                Selecciona el modo de medición (Voltaje, Corriente, Resistencia) y elige
                un componente para ver sus valores con precisión.
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 border border-purple-300">
              <p className="font-semibold text-purple-900 mb-1">📋 Ver Análisis Completo</p>
              <p className="text-xs text-purple-800">
                Haz clic en "Ver Valores del Circuito" para abrir un modal con todos
                los voltajes de nodos y datos de componentes.
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-3 border border-green-300">
              <p className="font-semibold text-green-900 mb-1">📊 Panel de Resultados</p>
              <p className="text-xs text-green-800">
                El panel derecho muestra un resumen de los resultados principales
                del circuito en tiempo real.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: '¡Listo para empezar! 🚀',
      icon: '✨',
      content: (
        <div className="space-y-3">
          <p className="text-gray-700">
            Ya conoces lo básico de SibaruCircuits. Ahora puedes:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 ml-4">
            <li>Crear tus propios circuitos desde cero</li>
            <li>Experimentar con diferentes configuraciones</li>
            <li>Analizar el comportamiento de los componentes</li>
            <li>Aprender sobre electrónica de forma práctica</li>
          </ul>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border-2 border-blue-300 mt-4">
            <p className="font-bold text-blue-900 mb-2">💡 Consejos adicionales:</p>
            <ul className="list-disc list-inside text-xs text-blue-800 space-y-1 ml-2">
              <li>Usa el botón "Limpiar" para empezar un nuevo circuito</li>
              <li>Puedes pausar y reiniciar la simulación en cualquier momento</li>
              <li>Los componentes se identifican automáticamente (R1, R2, V1, etc.)</li>
              <li>Siempre incluye al menos un nodo de tierra en tu circuito</li>
            </ul>
          </div>
          <div className="text-center mt-4">
            <p className="text-lg font-bold text-gray-800">¡Diviértete creando circuitos! ⚡</p>
          </div>
        </div>
      )
    }
  ];

  const currentStepData = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (!isLastStep) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{currentStepData.icon}</span>
              <div>
                <h2 className="text-xl font-bold">{currentStepData.title}</h2>
                <p className="text-xs opacity-90">
                  Paso {currentStep + 1} de {steps.length}
                </p>
              </div>
            </div>
            <button
              onClick={handleSkip}
              className="text-white hover:text-gray-200 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="bg-gray-200 h-2">
          <div
            className="bg-gradient-to-r from-blue-600 to-purple-600 h-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="px-6 py-6 overflow-y-auto max-h-[60vh]">
          {currentStepData.content}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
          <button
            onClick={handleSkip}
            className="text-sm text-gray-600 hover:text-gray-800 font-medium"
          >
            Saltar tutorial
          </button>
          
          <div className="flex items-center gap-2">
            {!isFirstStep && (
              <button
                onClick={handlePrevious}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors"
              >
                ← Anterior
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-colors"
            >
              {isLastStep ? '¡Comenzar! 🚀' : 'Siguiente →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeGuide;
