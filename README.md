# Simulador de Circuitos Eléctricos

**Herramienta educativa interactiva para el diseño y simulación de circuitos eléctricos básicos**

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-19.1.0-61DAFB.svg?logo=react)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 📋 Descripción

Este proyecto es un **simulador de circuitos eléctricos web** desarrollado con tecnologías modernas, diseñado para proporcionar una experiencia educativa e interactiva en el análisis de circuitos básicos. La aplicación permite a los usuarios crear circuitos mediante una interfaz drag-and-drop intuitiva, simular su comportamiento eléctrico y visualizar resultados en tiempo real.

El simulador implementa un motor de análisis nodal modificado (Modified Nodal Analysis - MNA) que resuelve sistemas de ecuaciones lineales para calcular voltajes, corrientes y potencias en cada componente del circuito.

## ✨ Características Principales

### Interfaz de Usuario

La aplicación cuenta con una interfaz moderna y profesional dividida en tres paneles principales:

- **Panel Izquierdo - Biblioteca de Componentes**: Contiene todos los componentes eléctricos disponibles con sus valores predeterminados. Los usuarios pueden agregar componentes al canvas con un simple clic.

- **Canvas Central Interactivo**: Área de trabajo con grid de fondo donde los usuarios pueden colocar y organizar componentes mediante drag-and-drop. Los componentes se pueden seleccionar, mover y rotar libremente.

- **Panel Derecho - Propiedades y Resultados**: Muestra las propiedades editables del componente seleccionado y los resultados de la simulación cuando está activa.

### Componentes Eléctricos Disponibles

El simulador incluye los siguientes componentes básicos:

| Componente | Símbolo | Valor Predeterminado | Descripción |
|------------|---------|---------------------|-------------|
| **Fuente de Voltaje** | ⊕ | 12 V | Fuente de voltaje DC constante |
| **Fuente de Corriente** | ⚡ | 1 A | Fuente de corriente DC constante |
| **Resistencia** | ▭ | 1000 Ω | Resistor con valor configurable |
| **Capacitor** | ‖ | 100 μF | Capacitor (análisis DC: circuito abierto) |
| **Inductor** | 〰 | 10 mH | Inductor (análisis DC: cortocircuito) |
| **LED** | ▷‖ | 2.2 V | Diodo emisor de luz |
| **Tierra** | ⏚ | 0 V | Nodo de referencia (GND) |

### Propiedades Editables

Cada componente permite editar las siguientes propiedades:

- **Etiqueta**: Nombre personalizado para identificar el componente
- **Valor**: Magnitud de la unidad de medida (voltaje, corriente, resistencia, etc.)
- **Rotación**: Orientación del componente en incrementos de 90°
- **Posición**: Coordenadas X e Y en el canvas

### Motor de Simulación

El simulador implementa un algoritmo de **análisis nodal modificado** que:

1. **Identifica nodos y conexiones** en el circuito
2. **Construye el sistema de ecuaciones** basado en las leyes de Kirchhoff
3. **Resuelve el sistema lineal** mediante eliminación gaussiana con pivoteo parcial
4. **Calcula resultados** de voltajes nodales, corrientes y potencias

El motor soporta:
- Circuitos con múltiples fuentes de voltaje y corriente
- Análisis DC (corriente continua)
- Cálculo automático de corrientes en todos los componentes
- Cálculo de potencia disipada o suministrada

### Resultados de Simulación

Una vez iniciada la simulación, el panel de resultados muestra:

- **Voltajes Nodales**: Voltaje en cada nodo del circuito respecto a tierra
- **Datos por Componente**: Para cada componente se muestra:
  - Voltaje a través del componente
  - Corriente que circula
  - Potencia disipada o suministrada

Los valores se presentan con **prefijos métricos automáticos** (G, M, k, m, μ, n, p) para facilitar la lectura.

## 🚀 Tecnologías Utilizadas

El proyecto está construido con un stack moderno de tecnologías web:

### Frontend

- **React 19.1.0**: Biblioteca principal para la interfaz de usuario
- **Vite 6.3.5**: Herramienta de build ultrarrápida
- **TailwindCSS**: Framework de CSS utility-first para estilos
- **shadcn/ui**: Componentes de UI accesibles y personalizables

### Visualización

- **Konva.js 10.0.2**: Biblioteca para canvas HTML5 de alto rendimiento
- **react-konva 19.0.10**: Integración de Konva con React

### Iconografía

- **Lucide React**: Conjunto de iconos modernos y consistentes

### Control de Versiones

- **Git**: Sistema de control de versiones
- **GitHub**: Repositorio remoto y colaboración

## 📦 Instalación y Configuración

### Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** (versión 18 o superior)
- **pnpm** (gestor de paquetes recomendado)
- **Git** (para clonar el repositorio)

### Pasos de Instalación

1. **Clonar el repositorio**

```bash
git clone https://github.com/simnnbarrera-ux/circuit-simulator.git
cd circuit-simulator
```

2. **Instalar dependencias**

```bash
pnpm install
```

3. **Iniciar el servidor de desarrollo**

```bash
pnpm run dev
```

La aplicación estará disponible en `http://localhost:5173/`

### Scripts Disponibles

El proyecto incluye los siguientes scripts en `package.json`:

```bash
# Iniciar servidor de desarrollo
pnpm run dev

# Compilar para producción
pnpm run build

# Previsualizar build de producción
pnpm run preview

# Ejecutar linter
pnpm run lint
```

## 🎯 Guía de Uso

### Crear un Circuito

1. **Agregar Componentes**: Haz clic en los botones del panel izquierdo para agregar componentes al canvas
2. **Posicionar**: Arrastra los componentes a la posición deseada
3. **Configurar**: Selecciona un componente y edita sus propiedades en el panel derecho
4. **Rotar**: Usa el botón "Rotar 90°" para cambiar la orientación

### Ejecutar Simulación

1. **Verificar Circuito**: Asegúrate de que el circuito tenga al menos un nodo de tierra
2. **Iniciar**: Haz clic en el botón verde "Iniciar Simulación"
3. **Visualizar Resultados**: Los resultados aparecerán en el panel derecho
4. **Pausar/Reiniciar**: Usa los controles de la barra superior según necesites

### Guardar y Cargar Proyectos

- **Guardar**: Haz clic en "Guardar" para exportar el circuito como archivo JSON
- **Cargar**: Haz clic en "Cargar" y selecciona un archivo JSON previamente guardado

## 🏗️ Arquitectura del Proyecto

### Estructura de Directorios

```
circuit-simulator/
├── public/                 # Archivos estáticos
│   └── favicon.ico
├── src/
│   ├── assets/            # Recursos (imágenes, iconos)
│   ├── components/        # Componentes React
│   │   ├── ui/           # Componentes de UI base (shadcn)
│   │   ├── CircuitCanvas.jsx
│   │   ├── ComponentLibrary.jsx
│   │   ├── PropertiesPanel.jsx
│   │   ├── ResultsPanel.jsx
│   │   └── Toolbar.jsx
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilidades y lógica de negocio
│   │   ├── circuitSimulator.js
│   │   └── utils.js
│   ├── App.css           # Estilos de la aplicación
│   ├── App.jsx           # Componente principal
│   ├── index.css         # Estilos globales
│   └── main.jsx          # Punto de entrada
├── .gitignore
├── components.json        # Configuración de shadcn/ui
├── eslint.config.js      # Configuración de ESLint
├── index.html            # HTML principal
├── package.json          # Dependencias y scripts
├── pnpm-lock.yaml        # Lock file de pnpm
├── README.md             # Este archivo
└── vite.config.js        # Configuración de Vite
```

### Componentes Principales

#### CircuitCanvas

Componente responsable del canvas interactivo donde se dibujan los componentes del circuito. Utiliza Konva.js para renderizado de alto rendimiento y gestiona:

- Renderizado de componentes con sus símbolos eléctricos
- Interacciones drag-and-drop
- Selección de componentes
- Grid de fondo para alineación visual

#### ComponentLibrary

Panel lateral que muestra la biblioteca de componentes disponibles. Cada botón permite agregar un nuevo componente al canvas con valores predeterminados.

#### PropertiesPanel

Panel que muestra y permite editar las propiedades del componente seleccionado, incluyendo valor, etiqueta, posición y rotación.

#### ResultsPanel

Muestra los resultados de la simulación, incluyendo voltajes nodales y datos detallados de cada componente (voltaje, corriente, potencia).

#### Toolbar

Barra de herramientas superior con controles para iniciar/pausar/reiniciar la simulación, guardar/cargar proyectos y limpiar el canvas.

### Motor de Simulación

El archivo `circuitSimulator.js` contiene la lógica del motor de simulación:

**Clase CircuitSimulator**

```javascript
class CircuitSimulator {
  constructor(components)
  simulate()                    // Ejecuta la simulación completa
  identifyNodes()              // Identifica nodos del circuito
  buildNodalEquations()        // Construye sistema Ax = b
  solveLinearSystem(A, b)      // Resuelve sistema lineal
  calculateResults(solution)   // Calcula corrientes y potencias
}
```

**Algoritmo de Análisis Nodal**

El motor implementa el método de análisis nodal modificado (MNA) que:

1. Asigna un número a cada nodo del circuito (tierra = 0)
2. Aplica la Ley de Corrientes de Kirchhoff (KCL) en cada nodo
3. Construye una matriz de conductancias y un vector de fuentes
4. Resuelve el sistema mediante eliminación gaussiana
5. Calcula corrientes usando la Ley de Ohm

## 🔧 Configuración de Despliegue

### Despliegue en Vercel

El proyecto está optimizado para despliegue en Vercel:

1. **Conectar Repositorio**: Vincula tu repositorio de GitHub con Vercel
2. **Configuración Automática**: Vercel detectará automáticamente Vite
3. **Build Command**: `pnpm run build`
4. **Output Directory**: `dist`
5. **Desplegar**: Vercel desplegará automáticamente en cada push a main

### Variables de Entorno

Actualmente el proyecto no requiere variables de entorno. Para futuras integraciones (base de datos, autenticación), crear un archivo `.env`:

```bash
# Ejemplo para futuras integraciones
VITE_API_URL=https://api.example.com
VITE_FIREBASE_API_KEY=your-api-key
```

## 🎓 Fundamentos Teóricos

### Análisis Nodal

El análisis nodal es un método sistemático para analizar circuitos eléctricos basado en la **Ley de Corrientes de Kirchhoff (KCL)**, que establece que la suma algebraica de corrientes que entran y salen de un nodo es cero.

Para un circuito con **n** nodos (excluyendo tierra) y **m** fuentes de voltaje, el sistema resultante tiene dimensión **(n + m) × (n + m)**.

### Ecuaciones Fundamentales

**Ley de Ohm**: La corriente a través de una resistencia es proporcional al voltaje aplicado.

```
I = V / R
```

**Ley de Potencia**: La potencia disipada o suministrada por un componente.

```
P = V × I
```

**Conductancia**: Inverso de la resistencia, facilita el análisis nodal.

```
G = 1 / R
```

### Limitaciones Actuales

La versión actual del simulador tiene las siguientes limitaciones:

- **Análisis DC únicamente**: No soporta análisis AC o transitorio
- **Componentes ideales**: No considera resistencias internas o no-idealidades
- **Sin conexiones explícitas**: Los nodos se asignan automáticamente, no hay cables visuales
- **Capacitores e inductores simplificados**: En DC, capacitores = circuito abierto, inductores = cortocircuito

## 🚧 Roadmap y Mejoras Futuras

### Versión 1.1 (Corto Plazo)

- [ ] Implementar conexiones visuales entre componentes (cables)
- [ ] Agregar más componentes: diodos, transistores, transformadores
- [ ] Mejorar validación de circuitos antes de simular
- [ ] Agregar tooltips con información de componentes
- [ ] Implementar zoom y pan en el canvas

### Versión 1.2 (Mediano Plazo)

- [ ] Análisis AC (corriente alterna) con fasores
- [ ] Análisis transitorio con integración numérica
- [ ] Gráficas de voltaje y corriente vs tiempo
- [ ] Exportar resultados a CSV/PDF
- [ ] Modo oscuro para la interfaz

### Versión 2.0 (Largo Plazo)

- [ ] Sistema de autenticación de usuarios
- [ ] Base de datos para guardar proyectos en la nube
- [ ] Biblioteca de circuitos predefinidos
- [ ] Colaboración en tiempo real
- [ ] Simulación de circuitos digitales
- [ ] Integración con SPICE para simulaciones avanzadas

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Para contribuir al proyecto:

1. **Fork** el repositorio
2. Crea una **rama** para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. **Push** a la rama (`git push origin feature/AmazingFeature`)
5. Abre un **Pull Request**

### Guías de Estilo

- Usar **nombres descriptivos** para variables y funciones
- Agregar **comentarios** para lógica compleja
- Seguir las convenciones de **React** y **JavaScript moderno**
- Mantener componentes **pequeños y reutilizables**
- Escribir código **limpio y legible**

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👥 Autor

**Desarrollado por**: Manus AI  
**Repositorio**: [https://github.com/simnnbarrera-ux/circuit-simulator](https://github.com/simnnbarrera-ux/circuit-simulator)

## 📞 Soporte

Para reportar bugs, solicitar features o hacer preguntas:

- **Issues**: [GitHub Issues](https://github.com/simnnbarrera-ux/circuit-simulator/issues)
- **Discusiones**: [GitHub Discussions](https://github.com/simnnbarrera-ux/circuit-simulator/discussions)

## 🙏 Agradecimientos

Este proyecto utiliza las siguientes tecnologías y bibliotecas de código abierto:

- [React](https://react.dev/) - Biblioteca de UI
- [Vite](https://vitejs.dev/) - Build tool
- [Konva.js](https://konvajs.org/) - Canvas library
- [TailwindCSS](https://tailwindcss.com/) - CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - Componentes de UI
- [Lucide](https://lucide.dev/) - Iconos

---

**¿Tienes preguntas o sugerencias?** No dudes en abrir un issue o contribuir al proyecto. ¡Toda ayuda es bienvenida! 🎉
