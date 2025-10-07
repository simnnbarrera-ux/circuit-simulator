# Guía Rápida de Uso - Simulador de Circuitos Eléctricos

## 🚀 Inicio Rápido

### 1. Agregar Componentes

En el **panel izquierdo** encontrarás la biblioteca de componentes disponibles:

- **Fuente de Voltaje** (12 V) - Color rojo
- **Fuente de Corriente** (1 A) - Color azul
- **Resistencia** (1000 Ω) - Color naranja
- **Capacitor** (100 μF) - Color verde
- **Inductor** (10 mH) - Color morado
- **LED** (2.2 V) - Color naranja
- **Tierra** (0 V) - Color rojo (referencia obligatoria)

**Haz clic** en cualquier componente para agregarlo al canvas central.

### 2. Posicionar Componentes

- **Arrastra** los componentes en el canvas para posicionarlos donde desees
- Los componentes se pueden mover libremente
- Usa el **grid de puntos** como referencia visual para alinear

### 3. Editar Propiedades

Cuando seleccionas un componente, el **panel derecho** muestra sus propiedades:

#### Propiedades Editables:

- **Etiqueta**: Nombre personalizado (ej: "R1", "Fuente Principal")
- **Valor**: Magnitud del componente
  - Voltaje para fuentes de voltaje (V)
  - Corriente para fuentes de corriente (A)
  - Resistencia para resistores (Ω)
  - Capacitancia para capacitores (μF)
  - Inductancia para inductores (mH)
- **Rotación**: Usa el botón "Rotar 90°" para cambiar la orientación
- **Posición**: Coordenadas X, Y en el canvas

### 4. Conectar Componentes

**Los componentes tienen terminales visibles** (puntos grises en los extremos):

#### Método Actual (Versión 1.0):

Por ahora, el sistema de conexiones está en desarrollo. Para simular un circuito:

1. **Posiciona los componentes** de forma lógica según tu circuito
2. El motor de simulación asignará nodos automáticamente
3. **Asegúrate de incluir al menos un componente de tierra**

#### Próximamente:

- Modo de conexión interactivo con cables visuales
- Click en terminales para crear conexiones
- Eliminación de conexiones individuales

### 5. Ejecutar Simulación

Una vez que tengas tu circuito armado:

1. **Verifica** que tengas al menos:
   - Una fuente (voltaje o corriente)
   - Un componente de tierra
   - Otros componentes conectados

2. **Haz clic** en el botón verde **"Iniciar Simulación"** en la barra superior

3. **Observa los resultados** en el panel derecho:
   - **Voltajes Nodales**: Voltaje en cada nodo respecto a tierra
   - **Datos por Componente**: Voltaje, corriente y potencia de cada elemento

### 6. Controles de Simulación

En la **barra de herramientas superior**:

- 🟢 **Iniciar Simulación**: Ejecuta el análisis del circuito
- ⏸️ **Pausar**: Pausa la simulación activa
- 🔄 **Reiniciar**: Reinicia la simulación
- 💾 **Guardar**: Exporta el circuito como archivo JSON
- 📂 **Cargar**: Importa un circuito previamente guardado
- 🗑️ **Limpiar**: Elimina todos los componentes del canvas

## 📊 Interpretando Resultados

### Voltajes Nodales

Muestra el voltaje en cada nodo del circuito:

```
Nodo 0: 0.000 V     (Tierra - siempre 0V)
Nodo 1: 12.000 V    (Nodo conectado al polo positivo)
Nodo 2: 6.000 V     (Nodo intermedio)
```

### Datos de Componentes

Para cada componente se muestra:

- **Voltaje**: Diferencia de potencial entre sus terminales
- **Corriente**: Flujo de corriente que lo atraviesa
- **Potencia**: Energía disipada o suministrada

**Ejemplo de Resistencia:**
```
Resistencia (R1)
├─ Voltaje: 12.000 V
├─ Corriente: 12.000 mA
└─ Potencia: 144.000 mW
```

## 💡 Ejemplos de Circuitos

### Circuito Básico: Divisor de Voltaje

**Componentes necesarios:**
1. Fuente de Voltaje (12V)
2. Resistencia R1 (1000Ω)
3. Resistencia R2 (1000Ω)
4. Tierra

**Configuración:**
1. Coloca la fuente de voltaje a la izquierda
2. Conecta R1 en serie (arriba)
3. Conecta R2 en serie (abajo)
4. Conecta tierra al terminal negativo de la fuente

**Resultado esperado:**
- Voltaje en nodo intermedio: 6V (mitad del voltaje de entrada)
- Corriente total: 12mA

### Circuito LED con Resistencia Limitadora

**Componentes necesarios:**
1. Fuente de Voltaje (12V)
2. Resistencia (1000Ω) - limitadora de corriente
3. LED (2.2V)
4. Tierra

**Configuración:**
1. Fuente de voltaje conectada a resistencia
2. Resistencia conectada a LED
3. LED conectado a tierra

**Resultado esperado:**
- Corriente a través del LED: ~10mA
- Voltaje en la resistencia: ~10V

## ⚠️ Errores Comunes

### "El circuito debe tener al menos un nodo de tierra"

**Solución**: Agrega un componente de **Tierra** al circuito. Es obligatorio como referencia de voltaje.

### "Conecta los componentes antes de iniciar la simulación"

**Solución**: Asegúrate de que los componentes estén conectados entre sí. En la versión actual, posiciónalos de forma lógica.

### Resultados inesperados o infinitos

**Causas posibles:**
- Circuito abierto (componentes sin conexión completa)
- Cortocircuito directo
- Fuentes de voltaje en serie sin resistencia

**Solución**: Revisa las conexiones y asegúrate de que el circuito sea válido.

## 🎨 Atajos y Tips

### Organización

- Usa el **grid de puntos** para alinear componentes
- Mantén un **flujo visual claro** de izquierda a derecha
- Agrupa componentes relacionados cerca

### Nomenclatura

- Usa etiquetas descriptivas: "R1", "R2", "V_in", "LED_rojo"
- Mantén consistencia en los nombres
- Documenta valores especiales

### Guardar y Cargar

- **Guarda frecuentemente** tu progreso
- Los archivos JSON son editables manualmente
- Puedes compartir circuitos exportando el JSON

## 🔮 Próximas Funcionalidades

### En Desarrollo:

- ✅ Sistema de conexiones visuales con cables
- ✅ Modo de conexión interactivo
- ⏳ Análisis AC (corriente alterna)
- ⏳ Gráficas de voltaje/corriente vs tiempo
- ⏳ Más componentes (diodos, transistores, transformadores)
- ⏳ Exportar resultados a PDF/CSV

### Planificado:

- 📱 Versión móvil optimizada
- 🌐 Guardar circuitos en la nube
- 👥 Compartir circuitos con otros usuarios
- 📚 Biblioteca de circuitos predefinidos
- 🎓 Tutoriales interactivos

## 🆘 Soporte

¿Encontraste un problema o tienes una sugerencia?

- **Issues**: [GitHub Issues](https://github.com/simnnbarrera-ux/circuit-simulator/issues)
- **Discusiones**: [GitHub Discussions](https://github.com/simnnbarrera-ux/circuit-simulator/discussions)

---

**¡Disfruta creando y simulando circuitos eléctricos!** ⚡🔌
