import React from 'react';
import { Line, Circle, Group, Text } from 'react-konva';

/**
 * Sistema de cables coloridos estilo Tinkercad
 */

// Colores vibrantes para los cables
const WIRE_COLORS = [
  '#FF0000', // Rojo
  '#0000FF', // Azul
  '#00FF00', // Verde
  '#FFA500', // Naranja
  '#FFFF00', // Amarillo
  '#FF00FF', // Magenta
  '#00FFFF', // Cian
  '#800080', // Púrpura
];

// Obtener color basado en el índice de conexión
const getWireColor = (connectionIndex) => {
  return WIRE_COLORS[connectionIndex % WIRE_COLORS.length];
};

// Calcular puntos de Bézier para cable curvo
const calculateBezierPoints = (x1, y1, x2, y2) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // Control points para curva suave
  const curvature = Math.min(distance * 0.3, 50);
  
  // Si es mayormente horizontal
  if (Math.abs(dx) > Math.abs(dy)) {
    return [
      x1, y1,
      x1 + curvature, y1,
      x2 - curvature, y2,
      x2, y2
    ];
  } else {
    // Si es mayormente vertical
    return [
      x1, y1,
      x1, y1 + curvature,
      x2, y2 - curvature,
      x2, y2
    ];
  }
};

// Cable individual con estilo Tinkercad
export const ColorfulWire = ({ 
  fromX, 
  fromY, 
  toX, 
  toY, 
  color, 
  isSelected,
  connectionIndex = 0
}) => {
  const wireColor = color || getWireColor(connectionIndex);
  const bezierPoints = calculateBezierPoints(fromX, fromY, toX, toY);
  
  return (
    <Group>
      {/* Sombra del cable */}
      <Line
        points={bezierPoints}
        stroke="rgba(0,0,0,0.2)"
        strokeWidth={isSelected ? 10 : 8}
        tension={0.5}
        bezier={true}
        x={2}
        y={2}
      />
      
      {/* Cable principal */}
      <Line
        points={bezierPoints}
        stroke={wireColor}
        strokeWidth={isSelected ? 8 : 6}
        tension={0.5}
        bezier={true}
        shadowColor="rgba(0,0,0,0.3)"
        shadowBlur={5}
        shadowOffset={{ x: 1, y: 1 }}
        lineCap="round"
        lineJoin="round"
      />
      
      {/* Brillo en el cable */}
      <Line
        points={bezierPoints}
        stroke="rgba(255,255,255,0.4)"
        strokeWidth={isSelected ? 3 : 2}
        tension={0.5}
        bezier={true}
        lineCap="round"
        lineJoin="round"
      />
    </Group>
  );
};

// Punto de conexión grande y visible
export const ConnectionPoint = ({ 
  x, 
  y, 
  color = '#FFD700',
  isHighlighted = false,
  isConnected = false,
  label = ''
}) => {
  const radius = isHighlighted ? 10 : 8;
  const outerRadius = isHighlighted ? 14 : 10;
  
  return (
    <Group x={x} y={y}>
      {/* Resplandor cuando está resaltado */}
      {isHighlighted && (
        <Circle
          x={0}
          y={0}
          radius={outerRadius + 8}
          fill={color}
          opacity={0.3}
          shadowBlur={15}
        />
      )}
      
      {/* Sombra */}
      <Circle
        x={2}
        y={2}
        radius={outerRadius}
        fill="rgba(0,0,0,0.3)"
      />
      
      {/* Anillo exterior */}
      <Circle
        x={0}
        y={0}
        radius={outerRadius}
        fill={isConnected ? color : '#CCCCCC'}
        stroke={isHighlighted ? '#FFFFFF' : '#999999'}
        strokeWidth={isHighlighted ? 3 : 1}
        shadowColor="rgba(0,0,0,0.3)"
        shadowBlur={5}
      />
      
      {/* Punto interior metálico */}
      <Circle
        x={0}
        y={0}
        radius={radius}
        fill={isConnected ? '#FFD700' : '#AAAAAA'}
        shadowColor="rgba(0,0,0,0.5)"
        shadowBlur={3}
      />
      
      {/* Brillo */}
      <Circle
        x={-radius * 0.3}
        y={-radius * 0.3}
        radius={radius * 0.4}
        fill="rgba(255,255,255,0.7)"
      />
      
      {/* Etiqueta del terminal */}
      {label && (
        <Group>
          <Circle
            x={outerRadius + 15}
            y={0}
            radius={10}
            fill="rgba(0,0,0,0.7)"
          />
          <Text
            x={outerRadius + 10}
            y={-6}
            text={label}
            fontSize={10}
            fill="#FFFFFF"
            fontStyle="bold"
          />
        </Group>
      )}
    </Group>
  );
};

// Cable temporal mientras se está conectando
export const TemporaryWire = ({ 
  fromX, 
  fromY, 
  toX, 
  toY, 
  color = '#3B82F6'
}) => {
  return (
    <Group>
      {/* Línea punteada animada */}
      <Line
        points={[fromX, fromY, toX, toY]}
        stroke={color}
        strokeWidth={4}
        dash={[10, 5]}
        opacity={0.7}
        lineCap="round"
      />
      
      {/* Punto de inicio */}
      <Circle
        x={fromX}
        y={fromY}
        radius={8}
        fill={color}
        opacity={0.8}
      />
      
      {/* Punto final (cursor) */}
      <Circle
        x={toX}
        y={toY}
        radius={6}
        fill={color}
        opacity={0.6}
        shadowBlur={10}
        shadowColor={color}
      />
    </Group>
  );
};

// Nodo de conexión (donde se unen múltiples cables)
export const ConnectionNode = ({ 
  x, 
  y, 
  nodeNumber,
  wireCount = 1,
  isHighlighted = false
}) => {
  const radius = 12 + (wireCount * 2);
  
  return (
    <Group x={x} y={y}>
      {/* Resplandor */}
      {isHighlighted && (
        <Circle
          x={0}
          y={0}
          radius={radius + 10}
          fill="#3B82F6"
          opacity={0.3}
          shadowBlur={20}
        />
      )}
      
      {/* Sombra */}
      <Circle
        x={2}
        y={2}
        radius={radius}
        fill="rgba(0,0,0,0.3)"
      />
      
      {/* Nodo principal */}
      <Circle
        x={0}
        y={0}
        radius={radius}
        fill="#1E40AF"
        stroke="#60A5FA"
        strokeWidth={2}
        shadowColor="rgba(0,0,0,0.5)"
        shadowBlur={5}
      />
      
      {/* Brillo */}
      <Circle
        x={-radius * 0.3}
        y={-radius * 0.3}
        radius={radius * 0.4}
        fill="rgba(255,255,255,0.5)"
      />
      
      {/* Etiqueta del nodo */}
      <Text
        x={0}
        y={-6}
        text={`N${nodeNumber}`}
        fontSize={10}
        fill="#FFFFFF"
        fontStyle="bold"
        align="center"
        offsetX={10}
      />
    </Group>
  );
};

// Exportar componentes
export default {
  ColorfulWire,
  ConnectionPoint,
  TemporaryWire,
  ConnectionNode,
  getWireColor
};
