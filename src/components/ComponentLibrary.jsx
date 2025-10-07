import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { 
  Zap, 
  Battery, 
  CircleDot, 
  Waves, 
  Radio, 
  Lightbulb,
  Anchor
} from 'lucide-react';

/**
 * ComponentLibrary - Biblioteca de componentes eléctricos disponibles
 * Permite agregar componentes al canvas mediante botones
 */
const ComponentLibrary = ({ onAddComponent }) => {
  const componentTypes = [
    {
      type: 'voltage_source',
      name: 'Fuente de Voltaje',
      icon: Battery,
      defaultValue: 12,
      unit: 'V',
      color: 'text-red-600'
    },
    {
      type: 'current_source',
      name: 'Fuente de Corriente',
      icon: Zap,
      defaultValue: 1,
      unit: 'A',
      color: 'text-blue-600'
    },
    {
      type: 'resistor',
      name: 'Resistencia',
      icon: CircleDot,
      defaultValue: 1000,
      unit: 'Ω',
      color: 'text-yellow-600'
    },
    {
      type: 'capacitor',
      name: 'Capacitor',
      icon: Waves,
      defaultValue: 100,
      unit: 'μF',
      color: 'text-green-600'
    },
    {
      type: 'inductor',
      name: 'Inductor',
      icon: Radio,
      defaultValue: 10,
      unit: 'mH',
      color: 'text-purple-600'
    },
    {
      type: 'led',
      name: 'LED',
      icon: Lightbulb,
      defaultValue: 2.2,
      unit: 'V',
      color: 'text-orange-600'
    },
    {
      type: 'ground',
      name: 'Tierra',
      icon: Anchor,
      defaultValue: 0,
      unit: 'V',
      color: 'text-gray-600'
    }
  ];

  const handleAddComponent = (componentType) => {
    const newComponent = {
      id: `${componentType.type}-${Date.now()}`,
      type: componentType.type,
      label: componentType.name,
      value: componentType.defaultValue,
      unit: componentType.unit,
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      rotation: 0,
      connections: []
    };
    onAddComponent(newComponent);
  };

  return (
    <Card className="h-full overflow-y-auto">
      <CardHeader>
        <CardTitle className="text-lg">Componentes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {componentTypes.map((componentType) => {
          const Icon = componentType.icon;
          return (
            <Button
              key={componentType.type}
              variant="outline"
              className="w-full justify-start gap-3 h-auto py-3 hover:bg-gray-50 transition-colors"
              onClick={() => handleAddComponent(componentType)}
            >
              <Icon className={`w-5 h-5 ${componentType.color}`} />
              <div className="flex flex-col items-start">
                <span className="font-medium text-sm">{componentType.name}</span>
                <span className="text-xs text-gray-500">
                  {componentType.defaultValue} {componentType.unit}
                </span>
              </div>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default ComponentLibrary;
