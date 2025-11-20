import React from 'react';

/**
 * ComponentLibrary Moderna - Estilo Tinkercad
 * Con miniaturas visuales de componentes
 */
const ComponentLibraryModern = ({ onAddComponent }) => {
  // Definición de componentes disponibles con iconos SVG
  const components = [
    {
      type: 'voltage_source',
      name: 'Fuente de Voltaje',
      value: 12,
      icon: (
        <svg viewBox="0 0 50 70" className="w-full h-full">
          <rect x="5" y="5" width="40" height="60" fill="#DC2626" stroke="#991B1B" strokeWidth="2" rx="5"/>
          <rect x="20" y="-5" width="10" height="10" fill="#FFD700" rx="2"/>
          <text x="25" y="30" fontSize="16" fill="white" fontWeight="bold" textAnchor="middle">+</text>
          <text x="25" y="50" fontSize="16" fill="white" fontWeight="bold" textAnchor="middle">-</text>
          <rect x="10" y="30" width="30" height="15" fill="white" opacity="0.9" rx="2"/>
          <text x="25" y="42" fontSize="12" fill="black" fontWeight="bold" textAnchor="middle">12V</text>
        </svg>
      ),
      color: '#DC2626'
    },
    {
      type: 'current_source',
      name: 'Fuente de Corriente',
      value: 1,
      icon: (
        <svg viewBox="0 0 50 50" className="w-full h-full">
          <circle cx="25" cy="25" r="20" fill="none" stroke="#3B82F6" strokeWidth="3"/>
          <circle cx="25" cy="25" r="15" fill="#60A5FA" opacity="0.3"/>
          <path d="M 25 10 L 25 40 M 20 35 L 25 40 L 30 35" stroke="#3B82F6" strokeWidth="3" fill="none"/>
          <text x="25" y="48" fontSize="10" fill="#3B82F6" fontWeight="bold" textAnchor="middle">1A</text>
        </svg>
      ),
      color: '#3B82F6'
    },
    {
      type: 'resistor',
      name: 'Resistencia',
      value: 1000,
      icon: (
        <svg viewBox="0 0 60 30" className="w-full h-full">
          <rect x="5" y="7" width="50" height="16" fill="#D4A574" stroke="#8B6F47" strokeWidth="1.5" rx="2"/>
          <rect x="10" y="9" width="3" height="12" fill="#8B4513"/>
          <rect x="17" y="9" width="3" height="12" fill="#FFD700"/>
          <rect x="24" y="9" width="3" height="12" fill="#000000"/>
          <rect x="38" y="9" width="3" height="12" fill="#FFD700"/>
          <line x1="0" y1="15" x2="5" y2="15" stroke="#C0C0C0" strokeWidth="2"/>
          <line x1="55" y1="15" x2="60" y2="15" stroke="#C0C0C0" strokeWidth="2"/>
        </svg>
      ),
      color: '#D4A574'
    },
    {
      type: 'capacitor',
      name: 'Capacitor',
      value: 100,
      icon: (
        <svg viewBox="0 0 40 50" className="w-full h-full">
          <rect x="8" y="5" width="24" height="35" fill="#1E3A8A" stroke="#1E40AF" strokeWidth="1.5" rx="10"/>
          <rect x="8" y="5" width="24" height="6" fill="#60A5FA" rx="10"/>
          <text x="20" y="18" fontSize="14" fill="white" fontWeight="bold" textAnchor="middle">+</text>
          <line x1="12" y1="32" x2="28" y2="32" stroke="white" strokeWidth="2"/>
          <line x1="18" y1="45" x2="22" y2="45" stroke="#C0C0C0" strokeWidth="2"/>
          <line x1="18" y1="0" x2="22" y2="0" stroke="#C0C0C0" strokeWidth="2"/>
        </svg>
      ),
      color: '#1E3A8A'
    },
    {
      type: 'inductor',
      name: 'Inductor',
      value: 10,
      icon: (
        <svg viewBox="0 0 70 30" className="w-full h-full">
          {[...Array(5)].map((_, i) => (
            <circle
              key={i}
              cx={10 + i * 12}
              cy="15"
              r="6"
              fill="none"
              stroke="#B8860B"
              strokeWidth="2.5"
            />
          ))}
          <rect x="0" y="13" width="70" height="4" fill="#8B4513"/>
          <line x1="0" y1="15" x2="5" y2="15" stroke="#C0C0C0" strokeWidth="2"/>
          <line x1="65" y1="15" x2="70" y2="15" stroke="#C0C0C0" strokeWidth="2"/>
        </svg>
      ),
      color: '#B8860B'
    },
    {
      type: 'led',
      name: 'LED',
      value: 2.2,
      icon: (
        <svg viewBox="0 0 40 50" className="w-full h-full">
          <circle cx="20" cy="25" r="13" fill="rgba(255,255,255,0.3)" stroke="#CCCCCC" strokeWidth="2"/>
          <circle cx="20" cy="25" r="8" fill="#FF0000"/>
          <circle cx="16" cy="21" r="4" fill="rgba(255,255,255,0.7)"/>
          <line x1="18" y1="10" x2="22" y2="10" stroke="#C0C0C0" strokeWidth="2"/>
          <line x1="18" y1="40" x2="22" y2="40" stroke="#C0C0C0" strokeWidth="2"/>
          <text x="8" y="12" fontSize="10" fill="#FF0000" fontWeight="bold">+</text>
          <text x="8" y="42" fontSize="10" fill="#000000" fontWeight="bold">-</text>
        </svg>
      ),
      color: '#FF0000'
    },
    {
      type: 'ground',
      name: 'Tierra',
      value: 0,
      icon: (
        <svg viewBox="0 0 40 50" className="w-full h-full">
          <line x1="20" y1="5" x2="20" y2="25" stroke="#000000" strokeWidth="3"/>
          <line x1="8" y1="25" x2="32" y2="25" stroke="#000000" strokeWidth="3"/>
          <line x1="12" y1="32" x2="28" y2="32" stroke="#666666" strokeWidth="2.5"/>
          <line x1="16" y1="39" x2="24" y2="39" stroke="#999999" strokeWidth="2"/>
          <circle cx="20" cy="5" r="4" fill="#FFD700" stroke="#B8860B" strokeWidth="2"/>
        </svg>
      ),
      color: '#000000'
    }
  ];

  const handleAddComponent = (componentType) => {
    const component = components.find(c => c.type === componentType);
    if (!component) return;

    const newComponent = {
      id: `${componentType}-${Date.now()}`,
      type: componentType,
      x: 400,
      y: 300,
      value: component.value,
      rotation: 0,
      label: component.name
    };

    onAddComponent(newComponent);
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-gray-50 to-white">
      {/* Encabezado */}
      <div className="px-4 py-4 border-b border-gray-200 bg-white">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <span className="text-2xl">🔧</span>
          <span>Componentes</span>
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Arrastra al canvas para agregar
        </p>
      </div>

      {/* Lista de componentes */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {components.map((component) => (
          <button
            key={component.type}
            onClick={() => handleAddComponent(component.type)}
            className="w-full group relative"
          >
            {/* Tarjeta del componente */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-3 hover:border-blue-400 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
              {/* Miniatura del componente */}
              <div className="h-16 flex items-center justify-center mb-2 bg-gray-50 rounded-lg">
                {component.icon}
              </div>

              {/* Nombre del componente */}
              <div className="text-center">
                <div className="font-semibold text-gray-800 text-sm">
                  {component.name}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {component.type === 'voltage_source' && `${component.value} V`}
                  {component.type === 'current_source' && `${component.value} A`}
                  {component.type === 'resistor' && `${component.value} Ω`}
                  {component.type === 'capacitor' && `${component.value} μF`}
                  {component.type === 'inductor' && `${component.value} mH`}
                  {component.type === 'led' && `${component.value} V`}
                  {component.type === 'ground' && `${component.value} V`}
                </div>
              </div>

              {/* Indicador de hover */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  +
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Pie de página con consejos */}
      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-600 space-y-1">
          <div className="flex items-start gap-2">
            <span className="text-blue-500">💡</span>
            <span>Haz clic en un componente para agregarlo al centro del canvas</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComponentLibraryModern;
