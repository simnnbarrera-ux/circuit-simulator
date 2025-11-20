import React from 'react';
import { Group, Circle, Rect, Line, Text, Path } from 'react-konva';

/**
 * Componentes con diseño realista estilo Tinkercad
 */

// Resistor realista con bandas de colores
export const RealisticResistor = ({ x, y, rotation, value, isSelected }) => {
  const width = 60;
  const height = 20;
  
  return (
    <Group x={x} y={y} rotation={rotation} offsetX={width / 2} offsetY={height / 2}>
      {/* Sombra */}
      <Rect
        x={2}
        y={2}
        width={width}
        height={height}
        fill="rgba(0,0,0,0.2)"
        cornerRadius={3}
      />
      
      {/* Cuerpo principal */}
      <Rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill="#D4A574"
        stroke={isSelected ? '#3B82F6' : '#8B6F47'}
        strokeWidth={isSelected ? 3 : 1}
        cornerRadius={3}
        shadowColor="rgba(0,0,0,0.3)"
        shadowBlur={5}
        shadowOffset={{ x: 1, y: 1 }}
      />
      
      {/* Bandas de colores */}
      <Rect x={12} y={2} width={4} height={16} fill="#8B4513" />
      <Rect x={20} y={2} width={4} height={16} fill="#FFD700" />
      <Rect x={28} y={2} width={4} height={16} fill="#000000" />
      <Rect x={44} y={2} width={4} height={16} fill="#FFD700" />
      
      {/* Terminales metálicos */}
      <Rect x={-8} y={7} width={10} height={6} fill="#C0C0C0" />
      <Rect x={width - 2} y={7} width={10} height={6} fill="#C0C0C0" />
      
      {/* Brillo */}
      <Rect
        x={0}
        y={0}
        width={width}
        height={6}
        fill="rgba(255,255,255,0.3)"
        cornerRadius={[3, 3, 0, 0]}
      />
    </Group>
  );
};

// LED realista con cápsula transparente
export const RealisticLED = ({ x, y, rotation, color = 'red', isSelected, isOn }) => {
  const radius = 15;
  const ledColors = {
    red: { body: '#FF0000', glow: '#FF6B6B' },
    blue: { body: '#0000FF', glow: '#6B6BFF' },
    green: { body: '#00FF00', glow: '#6BFF6B' },
    yellow: { body: '#FFFF00', glow: '#FFFF6B' }
  };
  
  const currentColor = ledColors[color] || ledColors.red;
  
  return (
    <Group x={x} y={y} rotation={rotation}>
      {/* Sombra */}
      <Circle
        x={2}
        y={2}
        radius={radius}
        fill="rgba(0,0,0,0.2)"
      />
      
      {/* Resplandor cuando está encendido */}
      {isOn && (
        <Circle
          x={0}
          y={0}
          radius={radius + 10}
          fill={currentColor.glow}
          opacity={0.4}
          shadowBlur={20}
        />
      )}
      
      {/* Cápsula transparente */}
      <Circle
        x={0}
        y={0}
        radius={radius}
        fill="rgba(255,255,255,0.3)"
        stroke={isSelected ? '#3B82F6' : '#CCCCCC'}
        strokeWidth={isSelected ? 3 : 2}
      />
      
      {/* Chip interno */}
      <Circle
        x={0}
        y={0}
        radius={radius * 0.6}
        fill={isOn ? currentColor.body : '#666666'}
        opacity={isOn ? 1 : 0.5}
      />
      
      {/* Brillo */}
      <Circle
        x={-radius * 0.3}
        y={-radius * 0.3}
        radius={radius * 0.3}
        fill="rgba(255,255,255,0.6)"
      />
      
      {/* Terminales */}
      <Rect x={-3} y={radius} width={6} height={15} fill="#C0C0C0" />
      <Rect x={-3} y={-radius - 15} width={6} height={15} fill="#C0C0C0" />
      
      {/* Marcas de polaridad */}
      <Text
        x={-radius - 15}
        y={-5}
        text="+"
        fontSize={12}
        fill="#FF0000"
        fontStyle="bold"
      />
      <Text
        x={-radius - 15}
        y={radius - 5}
        text="-"
        fontSize={12}
        fill="#000000"
        fontStyle="bold"
      />
    </Group>
  );
};

// Capacitor realista tipo electrolítico
export const RealisticCapacitor = ({ x, y, rotation, isSelected }) => {
  const width = 30;
  const height = 40;
  
  return (
    <Group x={x} y={y} rotation={rotation} offsetX={width / 2} offsetY={height / 2}>
      {/* Sombra */}
      <Rect
        x={2}
        y={2}
        width={width}
        height={height}
        fill="rgba(0,0,0,0.2)"
        cornerRadius={[15, 15, 3, 3]}
      />
      
      {/* Cuerpo principal */}
      <Rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill="#1E3A8A"
        stroke={isSelected ? '#3B82F6' : '#1E40AF'}
        strokeWidth={isSelected ? 3 : 1}
        cornerRadius={[15, 15, 3, 3]}
        shadowColor="rgba(0,0,0,0.3)"
        shadowBlur={5}
      />
      
      {/* Banda superior */}
      <Rect
        x={0}
        y={0}
        width={width}
        height={8}
        fill="#60A5FA"
        cornerRadius={[15, 15, 0, 0]}
      />
      
      {/* Marcas de polaridad */}
      <Text
        x={width / 2 - 4}
        y={12}
        text="+"
        fontSize={14}
        fill="#FFFFFF"
        fontStyle="bold"
      />
      
      {/* Línea negativa */}
      <Line
        points={[5, height - 10, width - 5, height - 10]}
        stroke="#FFFFFF"
        strokeWidth={2}
      />
      
      {/* Terminales */}
      <Rect x={width / 2 - 2} y={height} width={4} height={12} fill="#C0C0C0" />
      <Rect x={width / 2 - 2} y={-12} width={4} height={12} fill="#C0C0C0" />
      
      {/* Brillo */}
      <Rect
        x={0}
        y={0}
        width={width}
        height={15}
        fill="rgba(255,255,255,0.2)"
        cornerRadius={[15, 15, 0, 0]}
      />
    </Group>
  );
};

// Fuente de voltaje realista (batería)
export const RealisticVoltageSource = ({ x, y, rotation, voltage, isSelected }) => {
  const width = 50;
  const height = 70;
  
  return (
    <Group x={x} y={y} rotation={rotation} offsetX={width / 2} offsetY={height / 2}>
      {/* Sombra */}
      <Rect
        x={2}
        y={2}
        width={width}
        height={height}
        fill="rgba(0,0,0,0.2)"
        cornerRadius={5}
      />
      
      {/* Cuerpo principal */}
      <Rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill="#DC2626"
        stroke={isSelected ? '#3B82F6' : '#991B1B'}
        strokeWidth={isSelected ? 3 : 1}
        cornerRadius={5}
        shadowColor="rgba(0,0,0,0.3)"
        shadowBlur={5}
      />
      
      {/* Terminal positivo superior */}
      <Rect
        x={width / 2 - 5}
        y={-8}
        width={10}
        height={10}
        fill="#FFD700"
        cornerRadius={2}
      />
      
      {/* Etiqueta de voltaje */}
      <Rect
        x={5}
        y={height / 2 - 12}
        width={width - 10}
        height={24}
        fill="rgba(255,255,255,0.9)"
        cornerRadius={3}
      />
      
      <Text
        x={width / 2}
        y={height / 2 - 8}
        text={`${voltage}V`}
        fontSize={14}
        fill="#000000"
        fontStyle="bold"
        align="center"
        offsetX={15}
      />
      
      {/* Símbolo + */}
      <Text
        x={width / 2 - 8}
        y={10}
        text="+"
        fontSize={18}
        fill="#FFFFFF"
        fontStyle="bold"
      />
      
      {/* Símbolo - */}
      <Text
        x={width / 2 - 6}
        y={height - 25}
        text="-"
        fontSize={18}
        fill="#FFFFFF"
        fontStyle="bold"
      />
      
      {/* Terminal negativo inferior */}
      <Rect
        x={width / 2 - 5}
        y={height - 2}
        width={10}
        height={10}
        fill="#C0C0C0"
        cornerRadius={2}
      />
      
      {/* Brillo */}
      <Rect
        x={0}
        y={0}
        width={width}
        height={20}
        fill="rgba(255,255,255,0.3)"
        cornerRadius={[5, 5, 0, 0]}
      />
    </Group>
  );
};

// Tierra realista
export const RealisticGround = ({ x, y, isSelected }) => {
  return (
    <Group x={x} y={y}>
      {/* Sombra */}
      <Group x={2} y={2} opacity={0.3}>
        <Line points={[0, 0, 0, 20]} stroke="#000000" strokeWidth={3} />
        <Line points={[-15, 20, 15, 20]} stroke="#000000" strokeWidth={3} />
        <Line points={[-10, 27, 10, 27]} stroke="#000000" strokeWidth={2} />
        <Line points={[-5, 34, 5, 34]} stroke="#000000" strokeWidth={2} />
      </Group>
      
      {/* Símbolo principal */}
      <Line 
        points={[0, 0, 0, 20]} 
        stroke={isSelected ? '#3B82F6' : '#000000'} 
        strokeWidth={isSelected ? 4 : 3}
      />
      <Line 
        points={[-15, 20, 15, 20]} 
        stroke={isSelected ? '#3B82F6' : '#000000'} 
        strokeWidth={isSelected ? 4 : 3}
      />
      <Line 
        points={[-10, 27, 10, 27]} 
        stroke={isSelected ? '#3B82F6' : '#666666'} 
        strokeWidth={isSelected ? 3 : 2}
      />
      <Line 
        points={[-5, 34, 5, 34]} 
        stroke={isSelected ? '#3B82F6' : '#999999'} 
        strokeWidth={isSelected ? 3 : 2}
      />
      
      {/* Terminal de conexión */}
      <Circle
        x={0}
        y={0}
        radius={4}
        fill="#FFD700"
        stroke={isSelected ? '#3B82F6' : '#B8860B'}
        strokeWidth={2}
      />
    </Group>
  );
};

// Inductor realista (bobina)
export const RealisticInductor = ({ x, y, rotation, isSelected }) => {
  const width = 80;
  const height = 30;
  const coils = 5;
  
  return (
    <Group x={x} y={y} rotation={rotation} offsetX={width / 2} offsetY={height / 2}>
      {/* Sombra de las bobinas */}
      <Group x={2} y={2} opacity={0.2}>
        {[...Array(coils)].map((_, i) => (
          <Circle
            key={i}
            x={i * (width / coils)}
            y={height / 2}
            radius={height / 2}
            stroke="#000000"
            strokeWidth={3}
          />
        ))}
      </Group>
      
      {/* Bobinas */}
      {[...Array(coils)].map((_, i) => (
        <Circle
          key={i}
          x={i * (width / coils)}
          y={height / 2}
          radius={height / 2}
          stroke={isSelected ? '#3B82F6' : '#B8860B'}
          strokeWidth={isSelected ? 4 : 3}
          fill="none"
        />
      ))}
      
      {/* Núcleo */}
      <Rect
        x={0}
        y={height / 2 - 2}
        width={width}
        height={4}
        fill="#8B4513"
      />
      
      {/* Terminales */}
      <Rect x={-10} y={height / 2 - 2} width={12} height={4} fill="#C0C0C0" />
      <Rect x={width - 2} y={height / 2 - 2} width={12} height={4} fill="#C0C0C0" />
    </Group>
  );
};

export default {
  RealisticResistor,
  RealisticLED,
  RealisticCapacitor,
  RealisticVoltageSource,
  RealisticGround,
  RealisticInductor
};
