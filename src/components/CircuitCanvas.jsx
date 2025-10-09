import { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Line, Circle, Rect, Text, Group } from 'react-konva';

/**
 * Obtener texto del valor del componente con unidades e ID legible
 */
const getComponentValueText = (component) => {
  const { type, value, readableId } = component;
  const id = readableId || '';
  
  let valueText = '';
  
  switch (type) {
    case 'voltage_source':
      valueText = `${value} V`;
      break;
    case 'current_source':
      valueText = `${value} A`;
      break;
    case 'resistor':
      valueText = value >= 1000 ? `${(value / 1000).toFixed(1)} kΩ` : `${value} Ω`;
      break;
    case 'capacitor':
      valueText = value >= 1000 ? `${(value / 1000).toFixed(1)} mF` : `${value} μF`;
      break;
    case 'inductor':
      valueText = value >= 1000 ? `${(value / 1000).toFixed(1)} H` : `${value} mH`;
      break;
    case 'led':
      valueText = `${value} V`;
      break;
    case 'ground':
      return id || 'GND';
    default:
      return '';
  }
  
  return id ? `${id}: ${valueText}` : valueText;
};

/**
 * CircuitCanvas - Componente principal del canvas interactivo
 * Permite arrastrar y soltar componentes eléctricos y conectarlos
 */
const CircuitCanvas = ({ 
  components, 
  onComponentsChange, 
  selectedComponent, 
  onSelectComponent,
  connections = [],
  onConnectionsChange = () => {},
  simulationResults = null,
  isSimulating = false
}) => {
  const stageRef = useRef(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [isDragging, setIsDragging] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState(null);
  const [tempConnection, setTempConnection] = useState(null);

  // Ajustar el tamaño del canvas al contenedor
  useEffect(() => {
    const updateSize = () => {
      const container = document.getElementById('canvas-container');
      if (container) {
        setStageSize({
          width: container.offsetWidth,
          height: container.offsetHeight
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Manejar el arrastre de componentes
  const handleDragEnd = (e, id) => {
    const updatedComponents = components.map(comp => {
      if (comp.id === id) {
        return {
          ...comp,
          x: e.target.x(),
          y: e.target.y()
        };
      }
      return comp;
    });
    onComponentsChange(updatedComponents);
  };

  // Manejar la selección de componentes
  const handleSelect = (id) => {
    if (!isConnecting) {
      onSelectComponent(id);
    }
  };

  // Deseleccionar al hacer clic en el canvas vacío
  const handleStageClick = (e) => {
    if (e.target === e.target.getStage()) {
      onSelectComponent(null);
      if (isConnecting) {
        setIsConnecting(false);
        setConnectionStart(null);
        setTempConnection(null);
      }
    }
  };

  // Iniciar conexión desde un terminal
  const handleTerminalClick = (componentId, terminalIndex, x, y) => {
    if (!isConnecting) {
      // Iniciar nueva conexión
      setIsConnecting(true);
      setConnectionStart({ componentId, terminalIndex, x, y });
    } else {
      // Completar conexión
      if (connectionStart.componentId !== componentId) {
        const newConnection = {
          id: `conn-${Date.now()}`,
          from: { 
            componentId: connectionStart.componentId, 
            terminal: connectionStart.terminalIndex 
          },
          to: { 
            componentId, 
            terminal: terminalIndex 
          }
        };
        onConnectionsChange([...connections, newConnection]);
      }
      setIsConnecting(false);
      setConnectionStart(null);
      setTempConnection(null);
    }
  };

  // Actualizar conexión temporal mientras se arrastra
  const handleMouseMove = (e) => {
    if (isConnecting && connectionStart) {
      const stage = e.target.getStage();
      const pointerPos = stage.getPointerPosition();
      setTempConnection({
        x1: connectionStart.x,
        y1: connectionStart.y,
        x2: pointerPos.x,
        y2: pointerPos.y
      });
    }
  };

  // Calcular nodos a partir de las conexiones
  const calculateNodesFromConnections = () => {
    const nodeMap = new Map(); // Mapa de terminal -> nodo
    let nextNodeNumber = 0;
    
    // Función auxiliar para obtener la clave del terminal
    const getTerminalKey = (compId, terminalIdx) => `${compId}-${terminalIdx}`;
    
    // Asignar nodos a las tierras primero (siempre nodo 0)
    components.forEach(component => {
      if (component.type === 'ground') {
        const terminals = getComponentTerminals(component);
        terminals.forEach((_, idx) => {
          nodeMap.set(getTerminalKey(component.id, idx), 0);
        });
      }
    });
    
    // Si hay nodo 0, empezar desde 1
    if (nodeMap.size > 0) {
      nextNodeNumber = 1;
    }
    
    // Procesar conexiones
    connections.forEach(conn => {
      const fromKey = getTerminalKey(conn.from.componentId, conn.from.terminal);
      const toKey = getTerminalKey(conn.to.componentId, conn.to.terminal);
      
      const fromNode = nodeMap.get(fromKey);
      const toNode = nodeMap.get(toKey);
      
      if (fromNode !== undefined && toNode !== undefined) {
        // Ambos ya tienen nodo, no hacer nada (o podrían fusionarse)
      } else if (fromNode !== undefined) {
        // From tiene nodo, asignar el mismo a To
        nodeMap.set(toKey, fromNode);
      } else if (toNode !== undefined) {
        // To tiene nodo, asignar el mismo a From
        nodeMap.set(fromKey, toNode);
      } else {
        // Ninguno tiene nodo, crear uno nuevo
        nodeMap.set(fromKey, nextNodeNumber);
        nodeMap.set(toKey, nextNodeNumber);
        nextNodeNumber++;
      }
    });
    
    // Asignar nodos a terminales no conectados
    components.forEach(component => {
      const terminals = getComponentTerminals(component);
      terminals.forEach((_, idx) => {
        const key = getTerminalKey(component.id, idx);
        if (!nodeMap.has(key)) {
          nodeMap.set(key, nextNodeNumber);
          nextNodeNumber++;
        }
      });
    });
    
    return nodeMap;
  };

  // Obtener posición de un terminal específico
  const getTerminalPosition = (componentId, terminalIndex) => {
    const component = components.find(c => c.id === componentId);
    if (!component) return { x: 0, y: 0 };

    const terminals = getComponentTerminals(component);
    if (terminals[terminalIndex]) {
      return {
        x: component.x + terminals[terminalIndex].x,
        y: component.y + terminals[terminalIndex].y
      };
    }
    return { x: component.x, y: component.y };
  };

  // Eliminar conexión
  const handleConnectionClick = (connectionId) => {
    onConnectionsChange(connections.filter(c => c.id !== connectionId));
  };

  return (
    <div id="canvas-container" className="w-full h-full bg-white rounded-lg border-2 border-gray-200 relative overflow-hidden">
      {/* Grid de fondo */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
      
      {/* Indicador de modo conexión */}
      {isConnecting && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-10">
          🔌 Modo Conexión: Haz clic en otro terminal para conectar
        </div>
      )}
      
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        onClick={handleStageClick}
        onTap={handleStageClick}
        onMouseMove={handleMouseMove}
      >
        <Layer>
          {/* Renderizar grid de puntos */}
          {Array.from({ length: Math.floor(stageSize.width / 20) }).map((_, i) =>
            Array.from({ length: Math.floor(stageSize.height / 20) }).map((_, j) => (
              <Circle
                key={`grid-${i}-${j}`}
                x={i * 20}
                y={j * 20}
                radius={1}
                fill="#ddd"
              />
            ))
          )}

          {/* Renderizar conexiones */}
          {connections.map(connection => {
            const fromPos = getTerminalPosition(connection.from.componentId, connection.from.terminal);
            const toPos = getTerminalPosition(connection.to.componentId, connection.to.terminal);
            
            return (
              <Line
                key={connection.id}
                points={[fromPos.x, fromPos.y, toPos.x, toPos.y]}
                stroke="#2563eb"
                strokeWidth={3}
                onClick={() => handleConnectionClick(connection.id)}
                onTap={() => handleConnectionClick(connection.id)}
                hitStrokeWidth={10}
              />
            );
          })}

          {/* Renderizar conexión temporal */}
          {tempConnection && (
            <Line
              points={[tempConnection.x1, tempConnection.y1, tempConnection.x2, tempConnection.y2]}
              stroke="#93c5fd"
              strokeWidth={2}
              dash={[5, 5]}
            />
          )}

          {/* Renderizar componentes */}
          {components.map(component => (
            <ComponentShape
              key={component.id}
              component={component}
              isSelected={selectedComponent === component.id}
              onDragEnd={(e) => handleDragEnd(e, component.id)}
              onSelect={() => handleSelect(component.id)}
              onTerminalClick={handleTerminalClick}
              isConnecting={isConnecting}
            />
          ))}

          {/* Renderizar números de nodos siempre */}
          {components.length > 0 && (() => {
            const nodeMap = calculateNodesFromConnections();
            const nodePositions = new Map();
            
            // Calcular posiciones promedio para cada nodo
            components.forEach(component => {
              const terminals = getComponentTerminals(component);
              terminals.forEach((terminal, index) => {
                const key = `${component.id}-${index}`;
                const nodeNumber = nodeMap.get(key);
                
                if (nodeNumber !== undefined) {
                  if (!nodePositions.has(nodeNumber)) {
                    nodePositions.set(nodeNumber, { x: 0, y: 0, count: 0 });
                  }
                  const pos = nodePositions.get(nodeNumber);
                  pos.x += component.x + terminal.x;
                  pos.y += component.y + terminal.y;
                  pos.count += 1;
                }
              });
            });

            // Renderizar nodos
            return Array.from(nodePositions.entries()).map(([nodeNumber, pos]) => (
              <Group key={`node-${nodeNumber}`} x={pos.x / pos.count} y={pos.y / pos.count}>
                <Circle
                  radius={16}
                  fill="#3b82f6"
                  stroke="#1e40af"
                  strokeWidth={2}
                  shadowColor="black"
                  shadowBlur={5}
                  shadowOpacity={0.3}
                  shadowOffsetX={2}
                  shadowOffsetY={2}
                />
                <Text
                  x={-12}
                  y={-8}
                  width={24}
                  text={`N${nodeNumber}`}
                  fontSize={11}
                  fontStyle="bold"
                  fill="white"
                  align="center"
                />
              </Group>
            ));
          })()}
        </Layer>
      </Stage>
    </div>
  );
};

/**
 * ComponentShape - Renderiza un componente individual con sus terminales
 */
const ComponentShape = ({ component, isSelected, onDragEnd, onSelect, onTerminalClick, isConnecting }) => {
  const { type, x, y, rotation, label } = component;

  // Obtener terminales del componente
  const terminals = getComponentTerminals(component);

  return (
    <Group
      x={x}
      y={y}
      draggable={!isConnecting}
      onDragEnd={onDragEnd}
      onClick={onSelect}
      onTap={onSelect}
      rotation={rotation}
    >
      {/* Fondo de selección */}
      {isSelected && (
        <Rect
          x={-30}
          y={-30}
          width={60}
          height={60}
          stroke="#3b82f6"
          strokeWidth={2}
          dash={[5, 5]}
        />
      )}

      {/* Renderizar símbolo del componente */}
      {renderComponentSymbol(component)}

      {/* Valor del componente (sobre el símbolo) */}
      <Text
        x={-30}
        y={-45}
        width={60}
        text={getComponentValueText(component)}
        fontSize={11}
        fontStyle="bold"
        fill="#1f2937"
        align="center"
      />

      {/* Etiqueta del componente */}
      <Text
        x={-25}
        y={35}
        width={50}
        text={label || type}
        fontSize={10}
        fill="#374151"
        align="center"
      />

      {/* Renderizar terminales */}
      {terminals.map((terminal, index) => (
        <Group key={`terminal-${index}`}>
          <Circle
            x={terminal.x}
            y={terminal.y}
            radius={isConnecting ? 8 : 5}
            fill={isConnecting ? "#3b82f6" : "#6b7280"}
            stroke="#fff"
            strokeWidth={2}
            onClick={(e) => {
              e.cancelBubble = true;
              e.evt.stopPropagation();
              console.log('Terminal clicked:', component.id, index);
              onTerminalClick(component.id, index, x + terminal.x, y + terminal.y);
            }}
            onTap={(e) => {
              e.cancelBubble = true;
              e.evt.stopPropagation();
              onTerminalClick(component.id, index, x + terminal.x, y + terminal.y);
            }}
            onMouseEnter={(e) => {
              const container = e.target.getStage().container();
              container.style.cursor = 'pointer';
            }}
            onMouseLeave={(e) => {
              const container = e.target.getStage().container();
              container.style.cursor = 'default';
            }}
          />
          {/* Etiqueta del terminal para fuentes */}
          {(type === 'voltage_source' || type === 'current_source') && (
            <Text
              x={terminal.x - 8}
              y={terminal.y + 15}
              width={16}
              text={index === 0 ? '−' : '+'}
              fontSize={12}
              fontStyle="bold"
              fill={type === 'voltage_source' ? '#dc2626' : '#3b82f6'}
              align="center"
            />
          )}
        </Group>
      ))}
    </Group>
  );
};

/**
 * Obtener posiciones de terminales para cada tipo de componente
 */
const getComponentTerminals = (component) => {
  const { type, rotation = 0 } = component;
  
  // Terminales base (antes de rotación)
  let terminals = [];
  
  switch (type) {
    case 'voltage_source':
    case 'current_source':
    case 'resistor':
    case 'capacitor':
    case 'inductor':
    case 'led':
      terminals = [
        { x: -25, y: 0 },  // Terminal izquierdo
        { x: 25, y: 0 }    // Terminal derecho
      ];
      break;
    case 'ground':
      terminals = [
        { x: 0, y: -15 }   // Terminal superior
      ];
      break;
    default:
      terminals = [
        { x: -20, y: 0 },
        { x: 20, y: 0 }
      ];
  }

  // Aplicar rotación a los terminales
  return terminals.map(terminal => {
    const rad = (rotation * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    return {
      x: terminal.x * cos - terminal.y * sin,
      y: terminal.x * sin + terminal.y * cos
    };
  });
};

/**
 * Renderizar el símbolo del componente
 */
const renderComponentSymbol = (component) => {
  const { type, value } = component;

  switch (type) {
    case 'voltage_source':
      return (
        <>
          <Circle x={0} y={0} radius={20} stroke="#dc2626" strokeWidth={2} />
          <Line points={[-5, 0, 5, 0]} stroke="#dc2626" strokeWidth={2} />
          <Line points={[0, -5, 0, 5]} stroke="#dc2626" strokeWidth={2} />
          {/* Marcas de polaridad */}
          <Text x={18} y={-8} text="+" fontSize={16} fontStyle="bold" fill="#dc2626" />
          <Text x={-28} y={-8} text="−" fontSize={16} fontStyle="bold" fill="#dc2626" />
        </>
      );

    case 'current_source':
      return (
        <>
          <Circle x={0} y={0} radius={20} stroke="#2563eb" strokeWidth={2} />
          <Line points={[-8, 0, 8, 0]} stroke="#2563eb" strokeWidth={2} />
          <Line points={[4, -4, 8, 0, 4, 4]} stroke="#2563eb" strokeWidth={2} />
        </>
      );

    case 'resistor':
      return (
        <Line
          points={[-25, 0, -15, -8, -5, 8, 5, -8, 15, 8, 25, 0]}
          stroke="#f59e0b"
          strokeWidth={2}
        />
      );

    case 'capacitor':
      return (
        <>
          <Line points={[-25, 0, -5, 0]} stroke="#10b981" strokeWidth={2} />
          <Line points={[-5, -12, -5, 12]} stroke="#10b981" strokeWidth={3} />
          <Line points={[5, -12, 5, 12]} stroke="#10b981" strokeWidth={3} />
          <Line points={[5, 0, 25, 0]} stroke="#10b981" strokeWidth={2} />
        </>
      );

    case 'inductor':
      return (
        <Line
          points={[-25, 0, -15, 0, -15, -8, -5, -8, -5, 8, 5, 8, 5, -8, 15, -8, 15, 0, 25, 0]}
          stroke="#8b5cf6"
          strokeWidth={2}
        />
      );

    case 'led':
      return (
        <>
          <Line points={[-25, 0, -8, 0]} stroke="#f97316" strokeWidth={2} />
          <Line points={[-8, -10, -8, 10, 8, 0, -8, -10]} stroke="#f97316" strokeWidth={2} fill="#f97316" closed />
          <Line points={[8, -10, 8, 10]} stroke="#f97316" strokeWidth={2} />
          <Line points={[8, 0, 25, 0]} stroke="#f97316" strokeWidth={2} />
        </>
      );

    case 'ground':
      return (
        <>
          <Line points={[0, -15, 0, 0]} stroke="#ef4444" strokeWidth={2} />
          <Line points={[-15, 0, 15, 0]} stroke="#ef4444" strokeWidth={3} />
          <Line points={[-10, 5, 10, 5]} stroke="#ef4444" strokeWidth={2} />
          <Line points={[-5, 10, 5, 10]} stroke="#ef4444" strokeWidth={2} />
        </>
      );

    default:
      return <Circle x={0} y={0} radius={15} stroke="#6b7280" strokeWidth={2} />;
  }
};

export default CircuitCanvas;
