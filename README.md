# 🐍 Classic Snake Game

<p align="center">
  <img src="https://img.shields.io/badge/Status-Completado-brightgreen?style=for-the-badge" alt="Status">
  <img src="https://img.shields.io/badge/Category-Videojuego%202D-blue?style=for-the-badge" alt="Category">
  <img src="https://img.shields.io/badge/Tech-JavaScript%20%7C%20HTML5%20Canvas-yellow?style=for-the-badge" alt="Tech">
</p>

---

## 📌 Descripción del Proyecto
Este repositorio contiene el desarrollo del clásico juego de la serpiente (*Snake*). Es un proyecto interactivo enfocado en la programación basada en eventos, el renderizado de gráficos en dos dimensiones y el control de físicas/colisiones en tiempo real. 

El principal objetivo de este desarrollo fue dominar el ciclo de vida de un videojuego (*Game Loop*), la actualización constante del estado de la aplicación y la renderización fluida en el navegador web sin depender de librerías externas.

---

## 🛠️ Tecnologías Aplicadas

- **HTML5 (Canvas API):** Utilizado como el lienzo interactivo donde se dibujan, actualizan y borran dinámicamente la serpiente y la comida en cada fotograma.
- **CSS3:** Estilizado moderno para la interfaz periférica del juego, incluyendo el contenedor del canvas, fuentes personalizadas y un diseño responsivo/centrado.
- **JavaScript (Vanilla JS):** Core del proyecto. Implementa el control de intervalos de tiempo (`setInterval` / `requestAnimationFrame`), detección de eventos del teclado (flechas de dirección) y la estructura de datos (arreglos) para representar el cuerpo de la serpiente.

---

## 🕹️ Mecánicas y Características Técnicas
- **Game Loop Eficiente:** Renderizado constante que actualiza las coordenadas de la serpiente a una velocidad controlada para una jugabilidad fluida.
- **Sistema de Colisiones:** Lógica matemática avanzada para detectar cuándo la serpiente colisiona consigo misma o con los límites del tablero, desencadenando el evento de *Game Over*.
- **Estructura Dinámica (Arreglos/Arrays):** Manejo del cuerpo de la serpiente mediante un arreglo de coordenadas, donde cada elemento sigue la posición del bloque anterior, simulando el movimiento fluido.
- **Generación Aleatoria:** Lógica algorítmica para spawnear la comida en coordenadas aleatorias de la cuadrícula, evitando que aparezca encima del cuerpo actual de la serpiente.

---

## 🚀 Cómo Jugar en Local

Para ejecutar y jugar este proyecto en tu computadora:

1. **Clona este repositorio:**
   ```bash
   git clone [https://github.com/chaustrexp/Serpiente.git](https://github.com/chaustrexp/Serpiente.git)
