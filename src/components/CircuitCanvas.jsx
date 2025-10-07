import { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Line, Circle, Rect, Text, Group } from 'react-konva';

/**
 * CircuitCanvas - Componente principal del canvas interactivo
 * Permite arrastrar y soltar componentes eléctricos y conectarlos
 */
const CircuitCanvas = ({ components, onComponentsChange, selectedComponent, onSelectComponent }) => {
  const stageRef = useRef(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [isDragging, setIsDragging] = useState(false);

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
    onSelectComponent(id);
  };

  // Deseleccionar al hacer clic en el canvas vacío
  const handleStageClick = (e) => {
    if (e.target === e.target.getStage()) {
      onSelectComponent(null);
    }
  };

  return (
    <div id="canvas-container" className="w-full h-full bg-white rounded-lg border-2 border-gray-200 relative overflow-hidden">
      {/* Grid de fondo */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
      
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        onClick={handleStageClick}
        onTap={handleStageClick}
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

          {/* Renderizar componentes */}
          {components.map((component) => (
            <ComponentShape
              key={component.id}
              component={component}
              isSelected={selectedComponent === component.id}
              onDragEnd={(e) => handleDragEnd(e, component.id)}
              onSelect={() => handleSelect(component.id)}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
};

/**
 * ComponentShape - Renderiza la forma visual de cada componente
 */
const ComponentShape = ({ component, isSelected, onDragEnd, onSelect }) => {
  const { type, x, y, rotation = 0 } = component;

  // Renderizar según el tipo de componente
  const renderShape = () => {
    switch (type) {
      case 'resistor':
        return <ResistorShape />;
      case 'capacitor':
        return <CapacitorShape />;
      case 'inductor':
        return <InductorShape />;
      case 'voltage_source':
        return <VoltageSourceShape />;
      case 'current_source':
        return <CurrentSourceShape />;
      case 'led':
        return <LEDShape />;
      case 'ground':
        return <GroundShape />;
      default:
        return <Rect width={40} height={40} fill="gray" />;
    }
  };

  return (
    <Group
      x={x}
      y={y}
      draggable
      rotation={rotation}
      onDragEnd={onDragEnd}
      onClick={onSelect}
      onTap={onSelect}
    >
      {renderShape()}
      
      {/* Indicador de selección */}
      {isSelected && (
        <Rect
          x={-25}
          y={-25}
          width={50}
          height={50}
          stroke="#3b82f6"
          strokeWidth={2}
          dash={[5, 5]}
          listening={false}
        />
      )}

      {/* Etiqueta del componente */}
      <Text
        x={-20}
        y={30}
        text={component.label || type}
        fontSize={10}
        fill="#333"
        listening={false}
      />
    </Group>
  );
};

// Formas de componentes individuales

const ResistorShape = () => (
  <Group>
    <Line
      points={[-20, 0, -10, 0]}
      stroke="black"
      strokeWidth={2}
    />
    <Rect
      x={-10}
      y={-5}
      width={20}
      height={10}
      fill="white"
      stroke="black"
      strokeWidth={2}
    />
    <Line
      points={[10, 0, 20, 0]}
      stroke="black"
      strokeWidth={2}
    />
  </Group>
);

const CapacitorShape = () => (
  <Group>
    <Line
      points={[-20, 0, -2, 0]}
      stroke="black"
      strokeWidth={2}
    />
    <Line
      points={[-2, -10, -2, 10]}
      stroke="black"
      strokeWidth={2}
    />
    <Line
      points={[2, -10, 2, 10]}
      stroke="black"
      strokeWidth={2}
    />
    <Line
      points={[2, 0, 20, 0]}
      stroke="black"
      strokeWidth={2}
    />
  </Group>
);

const InductorShape = () => (
  <Group>
    <Line
      points={[-20, 0, -10, 0]}
      stroke="black"
      strokeWidth={2}
    />
    {/* Espirales del inductor */}
    {[-8, -4, 0, 4].map((x, i) => (
      <Circle
        key={i}
        x={x}
        y={-3}
        radius={3}
        stroke="black"
        strokeWidth={2}
      />
    ))}
    <Line
      points={[8, 0, 20, 0]}
      stroke="black"
      strokeWidth={2}
    />
  </Group>
);

const VoltageSourceShape = () => (
  <Group>
    <Circle
      x={0}
      y={0}
      radius={15}
      stroke="black"
      strokeWidth={2}
      fill="white"
    />
    <Line
      points={[-20, 0, -15, 0]}
      stroke="black"
      strokeWidth={2}
    />
    <Line
      points={[15, 0, 20, 0]}
      stroke="black"
      strokeWidth={2}
    />
    <Text
      x={-8}
      y={-6}
      text="+"
      fontSize={14}
      fill="red"
    />
    <Text
      x={-8}
      y={-2}
      text="−"
      fontSize={14}
      fill="black"
    />
  </Group>
);

const CurrentSourceShape = () => (
  <Group>
    <Circle
      x={0}
      y={0}
      radius={15}
      stroke="black"
      strokeWidth={2}
      fill="white"
    />
    <Line
      points={[-20, 0, -15, 0]}
      stroke="black"
      strokeWidth={2}
    />
    <Line
      points={[15, 0, 20, 0]}
      stroke="black"
      strokeWidth={2}
    />
    {/* Flecha de corriente */}
    <Line
      points={[0, -8, 0, 8]}
      stroke="blue"
      strokeWidth={2}
    />
    <Line
      points={[0, 8, -3, 5]}
      stroke="blue"
      strokeWidth={2}
    />
    <Line
      points={[0, 8, 3, 5]}
      stroke="blue"
      strokeWidth={2}
    />
  </Group>
);

const LEDShape = () => (
  <Group>
    <Line
      points={[-20, 0, -5, 0]}
      stroke="black"
      strokeWidth={2}
    />
    {/* Triángulo del LED */}
    <Line
      points={[-5, -8, -5, 8, 5, 0, -5, -8]}
      stroke="black"
      strokeWidth={2}
      fill="white"
      closed
    />
    <Line
      points={[5, -8, 5, 8]}
      stroke="black"
      strokeWidth={2}
    />
    <Line
      points={[5, 0, 20, 0]}
      stroke="black"
      strokeWidth={2}
    />
    {/* Flechas de luz */}
    <Line
      points={[8, -6, 12, -10]}
      stroke="orange"
      strokeWidth={1}
    />
    <Line
      points={[12, -10, 10, -10]}
      stroke="orange"
      strokeWidth={1}
    />
    <Line
      points={[12, -10, 12, -8]}
      stroke="orange"
      strokeWidth={1}
    />
  </Group>
);

const GroundShape = () => (
  <Group>
    <Line
      points={[0, -20, 0, 0]}
      stroke="black"
      strokeWidth={2}
    />
    <Line
      points={[-10, 0, 10, 0]}
      stroke="black"
      strokeWidth={2}
    />
    <Line
      points={[-7, 3, 7, 3]}
      stroke="black"
      strokeWidth={2}
    />
    <Line
      points={[-4, 6, 4, 6]}
      stroke="black"
      strokeWidth={2}
    />
  </Group>
);

export default CircuitCanvas;
