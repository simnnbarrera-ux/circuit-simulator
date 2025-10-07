import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Trash2, RotateCw } from 'lucide-react';

/**
 * PropertiesPanel - Panel de propiedades del componente seleccionado
 * Permite editar valores, etiquetas y otras propiedades
 */
const PropertiesPanel = ({ component, onUpdateComponent, onDeleteComponent }) => {
  if (!component) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg">Propiedades</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 text-center py-8">
            Selecciona un componente para ver sus propiedades
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleValueChange = (e) => {
    const newValue = parseFloat(e.target.value) || 0;
    onUpdateComponent({ ...component, value: newValue });
  };

  const handleLabelChange = (e) => {
    onUpdateComponent({ ...component, label: e.target.value });
  };

  const handleRotate = () => {
    const newRotation = (component.rotation + 90) % 360;
    onUpdateComponent({ ...component, rotation: newRotation });
  };

  const handleDelete = () => {
    onDeleteComponent(component.id);
  };

  // Obtener el nombre del tipo de componente
  const getComponentTypeName = (type) => {
    const names = {
      voltage_source: 'Fuente de Voltaje',
      current_source: 'Fuente de Corriente',
      resistor: 'Resistencia',
      capacitor: 'Capacitor',
      inductor: 'Inductor',
      led: 'LED',
      ground: 'Tierra'
    };
    return names[type] || type;
  };

  return (
    <Card className="h-full overflow-y-auto">
      <CardHeader>
        <CardTitle className="text-lg">Propiedades</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tipo de componente */}
        <div>
          <Label className="text-xs text-gray-500">Tipo</Label>
          <p className="text-sm font-medium mt-1">{getComponentTypeName(component.type)}</p>
        </div>

        {/* ID del componente */}
        <div>
          <Label className="text-xs text-gray-500">ID</Label>
          <p className="text-sm font-mono mt-1 text-gray-600">{component.id}</p>
        </div>

        {/* Etiqueta */}
        <div>
          <Label htmlFor="label">Etiqueta</Label>
          <Input
            id="label"
            type="text"
            value={component.label || ''}
            onChange={handleLabelChange}
            placeholder="Nombre del componente"
            className="mt-1"
          />
        </div>

        {/* Valor y unidad */}
        {component.type !== 'ground' && (
          <div>
            <Label htmlFor="value">
              Valor ({component.unit})
            </Label>
            <Input
              id="value"
              type="number"
              step="any"
              value={component.value || 0}
              onChange={handleValueChange}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formatValue(component.value, component.unit)}
            </p>
          </div>
        )}

        {/* Posición */}
        <div>
          <Label className="text-xs text-gray-500">Posición</Label>
          <p className="text-sm mt-1">
            X: {Math.round(component.x)}, Y: {Math.round(component.y)}
          </p>
        </div>

        {/* Rotación */}
        <div>
          <Label className="text-xs text-gray-500">Rotación</Label>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm">{component.rotation}°</p>
            <Button
              size="sm"
              variant="outline"
              onClick={handleRotate}
              className="ml-auto"
            >
              <RotateCw className="w-4 h-4 mr-1" />
              Rotar 90°
            </Button>
          </div>
        </div>

        {/* Acciones */}
        <div className="pt-4 border-t">
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleDelete}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Eliminar Componente
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Formatea el valor con prefijos métricos apropiados
 */
const formatValue = (value, unit) => {
  if (value === 0) return `0 ${unit}`;
  
  const prefixes = [
    { factor: 1e9, symbol: 'G' },
    { factor: 1e6, symbol: 'M' },
    { factor: 1e3, symbol: 'k' },
    { factor: 1, symbol: '' },
    { factor: 1e-3, symbol: 'm' },
    { factor: 1e-6, symbol: 'μ' },
    { factor: 1e-9, symbol: 'n' },
    { factor: 1e-12, symbol: 'p' }
  ];

  for (const prefix of prefixes) {
    if (Math.abs(value) >= prefix.factor) {
      const scaledValue = value / prefix.factor;
      return `${scaledValue.toFixed(2)} ${prefix.symbol}${unit}`;
    }
  }

  return `${value.toExponential(2)} ${unit}`;
};

export default PropertiesPanel;
