# 🚀 Guía Rápida - SibaruCircuits

## Inicio Rápido en 5 Pasos

### 1️⃣ Agregar Componentes
- Haz clic en cualquier componente del **panel izquierdo**
- El componente aparecerá en el canvas central
- Cada componente recibe un ID único (R1, V1, C1, etc.)

### 2️⃣ Posicionar y Editar
- **Arrastra** los componentes para moverlos
- **Haz clic** en un componente para seleccionarlo
- Edita sus propiedades en el **panel derecho**

### 3️⃣ Conectar Componentes

**Opción A: Conexión Automática**
- Posiciona los componentes cerca uno del otro
- Al iniciar la simulación, se conectarán automáticamente

**Opción B: Conexión Manual (Recomendado)**
1. Haz clic en **"Conectar Componentes"** en el toolbar
2. Los terminales se vuelven azules y más grandes
3. Haz clic en un terminal del primer componente
4. Haz clic en un terminal del segundo componente
5. ¡Conexión creada!

### 4️⃣ Simular el Circuito
- Asegúrate de tener al menos **un componente de tierra (GND)**
- Haz clic en **"Iniciar Simulación"** (botón verde)
- El simulador calculará voltajes, corrientes y potencias

### 5️⃣ Analizar Resultados

**Multímetro Digital** 🔬
- Aparece automáticamente al simular
- Selecciona el modo: Voltaje, Corriente o Resistencia
- Elige un componente para medir
- Lee los valores en la pantalla LCD

**Números de Nodos** 🔵
- Se muestran en el canvas durante la simulación
- Círculos azules con etiquetas N0, N1, N2...
- Indican los puntos de conexión del circuito

**Panel de Resultados** 📊
- Panel derecho muestra resumen de resultados
- Haz clic en "Ver Valores del Circuito" para análisis completo

---

## 🎯 Componentes Disponibles

| Componente | Símbolo | Descripción | ID |
|------------|---------|-------------|-----|
| **Fuente de Voltaje** | 🔴 Círculo con + | Suministra voltaje constante | V1, V2... |
| **Fuente de Corriente** | 🔵 Círculo con → | Suministra corriente constante | I1, I2... |
| **Resistencia** | 🟡 Zigzag | Limita el flujo de corriente | R1, R2... |
| **Capacitor** | 🟢 Líneas paralelas | Almacena energía eléctrica | C1, C2... |
| **Inductor** | 🟣 Espirales | Almacena energía magnética | L1, L2... |
| **LED** | 🟠 Triángulo | Diodo emisor de luz | D1, D2... |
| **Tierra** | 🔴 Símbolo GND | Referencia de voltaje (0V) | GND1... |

---

## 💡 Consejos Útiles

### ✅ Buenas Prácticas
- Siempre incluye al menos **un nodo de tierra** en tu circuito
- Usa el **modo de conexión manual** para mayor precisión
- **Revisa el multímetro** para verificar valores específicos
- **Guarda tu trabajo** regularmente (próximamente)

### ⚠️ Errores Comunes
- **"El circuito debe tener al menos un nodo de tierra"**
  - Solución: Agrega un componente de Tierra (GND)
  
- **"No hay componentes en el circuito"**
  - Solución: Agrega al menos un componente antes de simular

- **Valores incorrectos en simulación**
  - Solución: Verifica las conexiones y valores de componentes

### 🔧 Atajos y Trucos
- **Modo Conexión**: Actívalo antes de conectar para mejor control
- **Números de Nodos**: Solo visibles durante simulación
- **Multímetro**: Ciérralo si necesitas más espacio en pantalla
- **Ayuda**: Botón ❓ en la barra inferior para reabrir el tutorial

---

## 🎨 Interfaz de Usuario

### Barra Superior (Toolbar)
- 🟢 **Iniciar Simulación** - Ejecuta el análisis del circuito
- 🟡 **Pausar** - Pausa la simulación activa
- ⚪ **Reiniciar** - Reinicia la simulación manteniendo componentes
- 🔌 **Conectar Componentes** - Activa modo de conexión manual
- 📊 **Ver Valores del Circuito** - Abre modal de análisis completo
- 🔬 **Mostrar/Ocultar Multímetro** - Toggle del multímetro
- 💾 **Guardar** - Guarda el proyecto (próximamente)
- 📂 **Cargar** - Carga un proyecto guardado (próximamente)
- 🗑️ **Limpiar** - Elimina todos los componentes

### Panel Izquierdo
- Biblioteca de componentes
- Clic para agregar al canvas

### Canvas Central
- Área de diseño del circuito
- Arrastra componentes para posicionarlos
- Grid de puntos para referencia

### Panel Derecho
- **Propiedades**: Edita el componente seleccionado
- **Resultados**: Muestra datos de simulación

### Barra Inferior
- Contador de componentes
- Componente seleccionado actual
- Botón de ayuda (❓)
- Versión de la aplicación

---

## 🔬 Usando el Multímetro

### Modos de Medición

**⚡ Voltaje (V)**
- Mide la diferencia de potencial
- Útil para verificar caídas de voltaje
- Se muestra en Voltios (V)

**🔋 Corriente (A)**
- Mide el flujo de corriente
- Útil para verificar consumo
- Se muestra en Amperios (A)

**📊 Resistencia (Ω)**
- Mide la resistencia
- Solo funciona con resistores
- Se muestra en Ohmios (Ω)

### Cómo Usar
1. Inicia la simulación
2. El multímetro aparece automáticamente
3. Selecciona el modo de medición
4. Elige el componente del menú desplegable
5. Lee el valor en la pantalla LCD
6. Revisa la información completa en el panel inferior

---

## 🔌 Sistema de Conexiones

### Conexión Manual (Recomendado)

**Ventajas**:
- ✅ Control total sobre las conexiones
- ✅ Visualización clara de terminales
- ✅ Feedback visual durante el proceso
- ✅ Evita conexiones no deseadas

**Cómo Funcionar**:
1. Clic en "Conectar Componentes"
2. Banner azul aparece: "Modo Conexión Manual Activado"
3. Terminales se vuelven azules y más grandes
4. Etiquetas T0, T1 aparecen en terminales
5. Clic en terminal origen
6. Banner verde: "Conectando..."
7. Línea punteada sigue el cursor
8. Clic en terminal destino
9. Conexión creada (línea azul sólida)

### Conexión Automática

**Ventajas**:
- ✅ Rápida para circuitos simples
- ✅ No requiere modo especial

**Cómo Funciona**:
1. Posiciona componentes cerca (< 150px)
2. Inicia la simulación
3. Conexiones se crean automáticamente

---

## 📊 Interpretando Resultados

### Números de Nodos
- **N0**: Siempre es tierra (0V)
- **N1, N2, N3...**: Nodos del circuito
- Componentes conectados comparten nodos
- Útil para entender la topología del circuito

### Panel de Resultados
- **Voltajes de Nodos**: Potencial en cada nodo
- **Datos de Componentes**: Voltaje, corriente y potencia
- **Resumen**: Información general del circuito

### Multímetro
- **Pantalla LCD**: Valor principal con 6 decimales
- **Unidad**: Se muestra debajo del valor
- **Info Completa**: Panel inferior con V, I, P

---

## ❓ Preguntas Frecuentes

**P: ¿Puedo rotar componentes?**
R: Actualmente no, pero está en desarrollo.

**P: ¿Cómo elimino una conexión?**
R: Haz clic en la línea de conexión para eliminarla.

**P: ¿Cuántos componentes puedo agregar?**
R: No hay límite técnico, pero circuitos muy grandes pueden ser lentos.

**P: ¿Funciona en móviles?**
R: Sí, pero la experiencia es mejor en desktop.

**P: ¿Puedo exportar mi circuito?**
R: Función en desarrollo para próximas versiones.

**P: ¿Qué algoritmo usa el simulador?**
R: Análisis Nodal Modificado (MNA - Modified Nodal Analysis).

---

## 🆘 Soporte

Si encuentras problemas o tienes sugerencias:
1. Revisa esta guía
2. Abre el tutorial desde el botón ❓
3. Verifica que tu circuito tenga tierra
4. Intenta reiniciar la simulación

---

## 🎓 Aprende Más

### Recursos Recomendados
- **Ley de Ohm**: V = I × R
- **Leyes de Kirchhoff**: Base del análisis nodal
- **Análisis de Circuitos**: Teoría detrás del simulador

### Ejemplos de Circuitos
1. **Divisor de Voltaje**: V1 → R1 → R2 → GND
2. **LED Simple**: V1 → R1 → LED → GND
3. **Circuito RC**: V1 → R1 → C1 → GND

---

**¡Disfruta diseñando circuitos con SibaruCircuits! ⚡**

*Versión 1.0.0 - Octubre 2025*
