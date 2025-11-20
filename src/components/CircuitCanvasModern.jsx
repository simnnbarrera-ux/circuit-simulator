import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Text, Group } from 'react-konva';
import {
  RealisticResistor,
  RealisticLED,
  RealisticCapacitor,
  RealisticVoltageSource,
  RealisticGround,
  RealisticInductor
} from './RealisticComponents';
import {
  ColorfulWire,
  ConnectionPoint,
  TemporaryWire,
  ConnectionNode,
  getWireColor
} from './ColorfulWires';

/**
 * CircuitCanvas Moderno - Estilo Tinkercad
 * Con componentes realistas y cables coloridos
 */
const CircuitCanvasModern = ({ 
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
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState(null);
  const [tempConnection, setTempConnection] = useState(null);
  const [hoveredTerminal, setHoveredTerminal] = useState(null);

  // Ajustar tamaño del canvas
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

  // Manejar arrastre de componentes
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

  // Manejar selección de componente
  const handleSelect = (id) => {
    onSelectComponent(id);
  };

  // Manejar clic en el canvas vacío
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

  // Manejar clic en terminal
  const handleTerminalClick = (componentId, terminalIndex, x, y) => {
    if (!isConnecting) {
      // Iniciar conexión
      setIsConnecting(true);
      setConnectionStart({ componentId, terminalIndex, x, y });
      console.log('Connection started:', componentId, terminalIndex);
    } else {
      // Completar conexión
      if (connectionStart.componentId !== componentId) {
        const newConnection = {
          from: { componentId: connectionStart.componentId, terminal: connectionStart.terminalIndex },
          to: { componentId, terminal: terminalIndex }
        };
        onConnectionsChange([...connections, newConnection]);
        console.log('Connection completed:', newConnection);
      }
      setIsConnecting(false);
      setConnectionStart(null);
      setTempConnection(null);
    }
  };

  // Manejar movimiento del mouse para conexión temporal
  const handleMouseMove = (e) => {
    if (isConnecting && connectionStart) {
      const stage = e.target.getStage();
      const pointerPos = stage.getPointerPosition();
      setTempConnection({
        fromX: connectionStart.x,
        fromY: connectionStart.y,
        toX: pointerPos.x,
        toY: pointerPos.y
      });
    }
  };

  // Obtener posición de terminal
  const getTerminalPosition = (componentId, terminalIndex) => {
    const component = components.find(c => c.id === componentId);
    if (!component) return { x: 0, y: 0 };

    const terminals = getComponentTerminals(component);
    if (!terminals[terminalIndex]) return { x: component.x, y: component.y };

    const terminal = terminals[terminalIndex];
    return {
      x: component.x + terminal.x,
      y: component.y + terminal.y
    };
  };

  // Obtener terminales de componente
  const getComponentTerminals = (component) => {
    const { type, rotation = 0 } = component;
    
    let terminals = [];
    
    switch (type) {
      case 'voltage_source':
      case 'current_source':
        terminals = [
          { x: 0, y: -35 },  // Terminal superior
          { x: 0, y: 35 }    // Terminal inferior
        ];
        break;
      case 'resistor':
        terminals = [
          { x: -30, y: 0 },  // Terminal izquierdo
          { x: 30, y: 0 }    // Terminal derecho
        ];
        break;
      case 'capacitor':
        terminals = [
          { x: 0, y: -26 },  // Terminal superior
          { x: 0, y: 26 }    // Terminal inferior
        ];
        break;
      case 'inductor':
        terminals = [
          { x: -40, y: 0 },  // Terminal izquierdo
          { x: 40, y: 0 }    // Terminal derecho
        ];
        break;
      case 'led':
        terminals = [
          { x: 0, y: -30 },  // Terminal superior (+)
          { x: 0, y: 30 }    // Terminal inferior (-)
        ];
        break;
      case 'ground':
        terminals = [
          { x: 0, y: 0 }     // Terminal único
        ];
        break;
      default:
        terminals = [
          { x: -20, y: 0 },
          { x: 20, y: 0 }
        ];
    }

    // Aplicar rotación
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

  // Calcular nodos desde conexiones
  const calculateNodesFromConnections = () => {
    if (connections.length === 0) return [];

    const nodeMap = new Map();
    let nextNodeId = 1;

    // Asignar nodo 0 a todas las tierras
    components.forEach(comp => {
      if (comp.type === 'ground') {
        const terminals = getComponentTerminals(comp);
        terminals.forEach((_, termIdx) => {
          nodeMap.set(`${comp.id}-${termIdx}`, 0);
        });
      }
    });

    // Procesar conexiones
    connections.forEach(conn => {
      const fromKey = `${conn.from.componentId}-${conn.from.terminal}`;
      const toKey = `${conn.to.componentId}-${conn.to.terminal}`;

      const fromNode = nodeMap.get(fromKey);
      const toNode = nodeMap.get(toKey);

      if (fromNode !== undefined && toNode !== undefined) {
        // Ambos ya tienen nodo, unificar al menor
        const minNode = Math.min(fromNode, toNode);
        const maxNode = Math.max(fromNode, toNode);
        nodeMap.forEach((value, key) => {
          if (value === maxNode) {
            nodeMap.set(key, minNode);
          }
        });
      } else if (fromNode !== undefined) {
        nodeMap.set(toKey, fromNode);
      } else if (toNode !== undefined) {
        nodeMap.set(fromKey, toNode);
      } else {
        nodeMap.set(fromKey, nextNodeId);
        nodeMap.set(toKey, nextNodeId);
        nextNodeId++;
      }
    });

    // Calcular posiciones de nodos
    const nodePositions = new Map();
    nodeMap.forEach((nodeId, terminalKey) => {
      const [compId, termIdx] = terminalKey.split('-');
      const pos = getTerminalPosition(compId, parseInt(termIdx));
      
      if (!nodePositions.has(nodeId)) {
        nodePositions.set(nodeId, []);
      }
      nodePositions.get(nodeId).push(pos);
    });

    // Promediar posiciones
    const nodes = [];
    nodePositions.forEach((positions, nodeId) => {
      const avgX = positions.reduce((sum, p) => sum + p.x, 0) / positions.length;
      const avgY = positions.reduce((sum, p) => sum + p.y, 0) / positions.length;
      nodes.push({ id: nodeId, x: avgX, y: avgY, wireCount: positions.length });
    });

    return nodes;
  };

  // Renderizar componente realista
  const renderRealisticComponent = (component, isSelected) => {
    const commonProps = {
      x: component.x,
      y: component.y,
      rotation: component.rotation || 0,
      isSelected
    };

    switch (component.type) {
      case 'resistor':
        return <RealisticResistor key={component.id} {...commonProps} value={component.value} />;
      
      case 'led':
        return (
          <RealisticLED 
            key={component.id} 
            {...commonProps} 
            color="red" 
            isOn={isSimulating}
          />
        );
      
      case 'capacitor':
        return <RealisticCapacitor key={component.id} {...commonProps} />;
      
      case 'voltage_source':
        return (
          <RealisticVoltageSource 
            key={component.id} 
            {...commonProps} 
            voltage={component.value}
          />
        );
      
      case 'ground':
        return <RealisticGround key={component.id} x={component.x} y={component.y} isSelected={isSelected} />;
      
      case 'inductor':
        return <RealisticInductor key={component.id} {...commonProps} />;
      
      default:
        return null;
    }
  };

  const nodes = isSimulating ? calculateNodesFromConnections() : [];

  return (
    <div 
      id="canvas-container" 
      style={{ 
        width: '100%', 
        height: '100%', 
        backgroundColor: '#F3F4F6',
        backgroundImage: 'radial-gradient(circle, #D1D5DB 1px, transparent 1px)',
        backgroundSize: '20px 20px',
        position: 'relative'
      }}
    >
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        onClick={handleStageClick}
        onTap={handleStageClick}
        onMouseMove={handleMouseMove}
      >
        <Layer>
          {/* Renderizar cables (conexiones) */}
          {connections.map((conn, index) => {
            const fromPos = getTerminalPosition(conn.from.componentId, conn.from.terminal);
            const toPos = getTerminalPosition(conn.to.componentId, conn.to.terminal);
            
            return (
              <ColorfulWire
                key={`wire-${index}`}
                fromX={fromPos.x}
                fromY={fromPos.y}
                toX={toPos.x}
                toY={toPos.y}
                connectionIndex={index}
                isSelected={false}
              />
            );
          })}

          {/* Cable temporal durante conexión */}
          {tempConnection && (
            <TemporaryWire
              fromX={tempConnection.fromX}
              fromY={tempConnection.fromY}
              toX={tempConnection.toX}
              toY={tempConnection.toY}
            />
          )}

          {/* Renderizar componentes */}
          {components.map(component => {
            const isSelected = selectedComponent === component.id;
            
            return (
              <Group
                key={component.id}
                draggable={!isConnecting}
                onDragEnd={(e) => handleDragEnd(e, component.id)}
                onClick={() => handleSelect(component.id)}
                onTap={() => handleSelect(component.id)}
              >
                {/* Componente realista */}
                {renderRealisticComponent(component, isSelected)}

                {/* Etiqueta del componente */}
                <Text
                  x={component.x - 40}
                  y={component.y - 60}
                  width={80}
                  text={component.readableId || component.id.split('-')[0]}
                  fontSize={12}
                  fontStyle="bold"
                  fill="#1F2937"
                  align="center"
                  shadowColor="rgba(255,255,255,0.8)"
                  shadowBlur={3}
                />

                {/* Puntos de conexión (terminales) */}
                {getComponentTerminals(component).map((terminal, termIdx) => {
                  const terminalKey = `${component.id}-${termIdx}`;
                  const isHovered = hoveredTerminal === terminalKey;
                  const isConnected = connections.some(
                    conn => 
                      (conn.from.componentId === component.id && conn.from.terminal === termIdx) ||
                      (conn.to.componentId === component.id && conn.to.terminal === termIdx)
                  );

                  return (
                    <ConnectionPoint
                      key={terminalKey}
                      x={component.x + terminal.x}
                      y={component.y + terminal.y}
                      isHighlighted={isHovered || isConnecting}
                      isConnected={isConnected}
                      label={component.type === 'voltage_source' && termIdx === 0 ? '+' : 
                             component.type === 'voltage_source' && termIdx === 1 ? '-' : ''}
                      onClick={() => handleTerminalClick(component.id, termIdx, 
                        component.x + terminal.x, component.y + terminal.y)}
                      onMouseEnter={() => setHoveredTerminal(terminalKey)}
                      onMouseLeave={() => setHoveredTerminal(null)}
                    />
                  );
                })}
              </Group>
            );
          })}

          {/* Renderizar nodos durante simulación */}
          {nodes.map(node => (
            <ConnectionNode
              key={`node-${node.id}`}
              x={node.x}
              y={node.y}
              nodeNumber={node.id}
              wireCount={node.wireCount}
              isHighlighted={false}
            />
          ))}
        </Layer>
      </Stage>

      {/* Indicador de modo conexión */}
      {isConnecting && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#3B82F6',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          fontWeight: 'bold',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          zIndex: 1000
        }}>
          🔌 Haz clic en otro terminal para completar la conexión
        </div>
      )}
    </div>
  );
};

export default CircuitCanvasModern;
