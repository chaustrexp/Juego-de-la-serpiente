// Elementos del DOM
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const finalScoreElement = document.getElementById('finalScore');
const gameOverScreen = document.getElementById('gameOver');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const keyboardModeBtn = document.getElementById('keyboardMode');
const cameraModeBtn = document.getElementById('cameraMode');
const cameraSection = document.getElementById('cameraSection');
const cameraStatus = document.getElementById('cameraStatus');
const directionValue = document.getElementById('directionValue');
const confidenceFill = document.getElementById('confidenceFill');
const instructionsElement = document.getElementById('instructions');

// Configuración del juego
const GRID_SIZE = 20; // Tamaño de cada celda
const TILE_COUNT = canvas.width / GRID_SIZE; // Número de celdas (20x20)
const GAME_SPEED = 100; // Velocidad del juego en ms

// Variables del juego
let snake = [];
let velocityX = 0;
let velocityY = 0;
let appleX = 0;
let appleY = 0;
let score = 0;
let gameLoop = null;
let gameRunning = false;

// Variables de Teachable Machine
const MODEL_URL = 'https://teachablemachine.withgoogle.com/models/0qcbTJ6iB/';
let model, webcam, maxPredictions;
let cameraEnabled = true;
let cameraInitialized = false;
let predictionLoop = null;

// Inicializar el juego
function initGame() {
    // Posición inicial de la serpiente (centro del canvas)
    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];
    
    // Dirección inicial (derecha)
    velocityX = 1;
    velocityY = 0;
    
    // Resetear puntaje
    score = 0;
    updateScore();
    
    // Generar primera manzana
    generateApple();
    
    // Ocultar pantallas
    gameOverScreen.classList.remove('show');
    startBtn.classList.add('hidden');
}

// Generar manzana en posición aleatoria
function generateApple() {
    // Generar posición aleatoria
    appleX = Math.floor(Math.random() * TILE_COUNT);
    appleY = Math.floor(Math.random() * TILE_COUNT);
    
    // Verificar que no aparezca sobre la serpiente
    for (let segment of snake) {
        if (segment.x === appleX && segment.y === appleY) {
            generateApple(); // Regenerar si está sobre la serpiente
            return;
        }
    }
}

// Actualizar puntaje
function updateScore() {
    scoreElement.textContent = score;
}

// Dibujar la serpiente con efectos visuales
function drawSnake() {
    snake.forEach((segment, index) => {
        // Cabeza de la serpiente (más grande y diferente color)
        if (index === 0) {
            // Sombra de la cabeza
            ctx.shadowBlur = 12;
            ctx.shadowColor = 'rgba(255, 107, 53, 0.6)';
            
            // Degradado para la cabeza
            const gradient = ctx.createRadialGradient(
                segment.x * GRID_SIZE + GRID_SIZE / 2,
                segment.y * GRID_SIZE + GRID_SIZE / 2,
                0,
                segment.x * GRID_SIZE + GRID_SIZE / 2,
                segment.y * GRID_SIZE + GRID_SIZE / 2,
                GRID_SIZE
            );
            gradient.addColorStop(0, '#ffeaa7');
            gradient.addColorStop(1, '#fdcb6e');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(
                segment.x * GRID_SIZE + GRID_SIZE / 2,
                segment.y * GRID_SIZE + GRID_SIZE / 2,
                GRID_SIZE / 2 - 1,
                0,
                Math.PI * 2
            );
            ctx.fill();
            
            // Ojos de la serpiente
            ctx.fillStyle = '#2d3436';
            ctx.shadowBlur = 0;
            
            if (velocityX === 1) { // Derecha
                ctx.beginPath();
                ctx.arc(segment.x * GRID_SIZE + 14, segment.y * GRID_SIZE + 7, 2, 0, Math.PI * 2);
                ctx.arc(segment.x * GRID_SIZE + 14, segment.y * GRID_SIZE + 13, 2, 0, Math.PI * 2);
                ctx.fill();
            } else if (velocityX === -1) { // Izquierda
                ctx.beginPath();
                ctx.arc(segment.x * GRID_SIZE + 6, segment.y * GRID_SIZE + 7, 2, 0, Math.PI * 2);
                ctx.arc(segment.x * GRID_SIZE + 6, segment.y * GRID_SIZE + 13, 2, 0, Math.PI * 2);
                ctx.fill();
            } else if (velocityY === -1) { // Arriba
                ctx.beginPath();
                ctx.arc(segment.x * GRID_SIZE + 7, segment.y * GRID_SIZE + 6, 2, 0, Math.PI * 2);
                ctx.arc(segment.x * GRID_SIZE + 13, segment.y * GRID_SIZE + 6, 2, 0, Math.PI * 2);
                ctx.fill();
            } else if (velocityY === 1) { // Abajo
                ctx.beginPath();
                ctx.arc(segment.x * GRID_SIZE + 7, segment.y * GRID_SIZE + 14, 2, 0, Math.PI * 2);
                ctx.arc(segment.x * GRID_SIZE + 13, segment.y * GRID_SIZE + 14, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        } else {
            // Cuerpo de la serpiente con degradado
            const gradient = ctx.createLinearGradient(
                segment.x * GRID_SIZE,
                segment.y * GRID_SIZE,
                segment.x * GRID_SIZE + GRID_SIZE,
                segment.y * GRID_SIZE + GRID_SIZE
            );
            gradient.addColorStop(0, '#fab1a0');
            gradient.addColorStop(1, '#ff7675');
            
            ctx.shadowBlur = 8;
            ctx.shadowColor = 'rgba(255, 118, 117, 0.5)';
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(
                segment.x * GRID_SIZE + GRID_SIZE / 2,
                segment.y * GRID_SIZE + GRID_SIZE / 2,
                GRID_SIZE / 2 - 2,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
    });
    
    ctx.shadowBlur = 0;
}

// Dibujar la manzana con efectos visuales
function drawApple() {
    // Sombra de la manzana
    ctx.shadowBlur = 15;
    ctx.shadowColor = 'rgba(0, 184, 148, 0.6)';
    
    // Degradado radial para la manzana
    const gradient = ctx.createRadialGradient(
        appleX * GRID_SIZE + GRID_SIZE / 3,
        appleY * GRID_SIZE + GRID_SIZE / 3,
        2,
        appleX * GRID_SIZE + GRID_SIZE / 2,
        appleY * GRID_SIZE + GRID_SIZE / 2,
        GRID_SIZE / 2
    );
    gradient.addColorStop(0, '#55efc4');
    gradient.addColorStop(0.6, '#00b894');
    gradient.addColorStop(1, '#00a885');
    
    // Dibujar círculo de la manzana
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(
        appleX * GRID_SIZE + GRID_SIZE / 2,
        appleY * GRID_SIZE + GRID_SIZE / 2,
        GRID_SIZE / 2 - 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
    
    // Brillo en la manzana
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.arc(
        appleX * GRID_SIZE + GRID_SIZE / 3,
        appleY * GRID_SIZE + GRID_SIZE / 3,
        3,
        0,
        Math.PI * 2
    );
    ctx.fill();
    
    // Hoja de la manzana
    ctx.fillStyle = '#27ae60';
    ctx.beginPath();
    ctx.ellipse(
        appleX * GRID_SIZE + GRID_SIZE / 2 + 3,
        appleY * GRID_SIZE + 4,
        3,
        5,
        Math.PI / 4,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

// Mover la serpiente
function moveSnake() {
    // Crear nueva cabeza basada en la velocidad
    const head = {
        x: snake[0].x + velocityX,
        y: snake[0].y + velocityY
    };
    
    // Agregar nueva cabeza al inicio
    snake.unshift(head);
    
    // Verificar si comió la manzana
    if (head.x === appleX && head.y === appleY) {
        score++;
        updateScore();
        generateApple();
        // No quitar la cola (la serpiente crece)
    } else {
        // Quitar la cola (movimiento normal)
        snake.pop();
    }
}

// Verificar colisiones
function checkCollision() {
    const head = snake[0];
    
    // Colisión con paredes
    if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
        return true;
    }
    
    // Colisión con el propio cuerpo
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    
    return false;
}

// Game Over
function gameOver() {
    gameRunning = false;
    clearInterval(gameLoop);
    finalScoreElement.textContent = score;
    gameOverScreen.classList.add('show');
}

// Loop principal del juego
function update() {
    if (!gameRunning) return;
    
    // Mover serpiente
    moveSnake();
    
    // Verificar colisiones
    if (checkCollision()) {
        gameOver();
        return;
    }
    
    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar elementos
    drawApple();
    drawSnake();
}

// Iniciar el juego
function startGame() {
    if (gameRunning) return;
    
    initGame();
    gameRunning = true;
    gameLoop = setInterval(update, GAME_SPEED);
}

// Control del teclado
let lastDirection = { x: 1, y: 0 }; // Para evitar movimientos contrarios

document.addEventListener('keydown', (e) => {
    if (!gameRunning) return;
    
    switch (e.key) {
        case 'ArrowUp':
            // No permitir ir hacia abajo si ya va hacia arriba
            if (lastDirection.y !== 1) {
                velocityX = 0;
                velocityY = -1;
                lastDirection = { x: 0, y: -1 };
            }
            e.preventDefault();
            break;
        case 'ArrowDown':
            // No permitir ir hacia arriba si ya va hacia abajo
            if (lastDirection.y !== -1) {
                velocityX = 0;
                velocityY = 1;
                lastDirection = { x: 0, y: 1 };
            }
            e.preventDefault();
            break;
        case 'ArrowLeft':
            // No permitir ir hacia la derecha si ya va hacia la izquierda
            if (lastDirection.x !== 1) {
                velocityX = -1;
                velocityY = 0;
                lastDirection = { x: -1, y: 0 };
            }
            e.preventDefault();
            break;
        case 'ArrowRight':
            // No permitir ir hacia la izquierda si ya va hacia la derecha
            if (lastDirection.x !== -1) {
                velocityX = 1;
                velocityY = 0;
                lastDirection = { x: 1, y: 0 };
            }
            e.preventDefault();
            break;
    }
});

// ========== FUNCIONES DE TEACHABLE MACHINE ==========

// Inicializar el modelo y la cámara
async function initCamera() {
    try {
        cameraStatus.innerHTML = '<span class="status-icon">⏳</span><span class="status-text">Cargando modelo...</span>';
        
        // Cargar el modelo
        const modelURL = MODEL_URL + 'model.json';
        const metadataURL = MODEL_URL + 'metadata.json';
        
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();
        
        // Configurar la webcam
        const flip = true;
        webcam = new tmImage.Webcam(200, 200, flip);
        await webcam.setup();
        await webcam.play();
        
        cameraInitialized = true;
        cameraStatus.innerHTML = '<span class="status-icon">✅</span><span class="status-text">Cámara activa</span>';
        
        // Agregar el canvas de la webcam al DOM
        document.getElementById('webcam-wrapper').appendChild(webcam.canvas);
        
        // Iniciar el loop de predicción
        predictionLoop = requestAnimationFrame(predictLoop);
        
    } catch (error) {
        console.error('Error al inicializar la cámara:', error);
        cameraStatus.innerHTML = '<span class="status-icon">❌</span><span class="status-text">Error: ' + error.message + '</span>';
        cameraEnabled = false;
    }
}

// Loop de predicción
async function predictLoop() {
    if (!cameraEnabled || !cameraInitialized) return;
    
    webcam.update();
    const prediction = await model.predict(webcam.canvas);
    
    // Actualizar las predicciones en la UI
    updatePredictions(prediction);
    
    // Cambiar dirección de la serpiente basado en la predicción más alta
    if (gameRunning) {
        changeDirectionFromPrediction(prediction);
    }
    
    predictionLoop = requestAnimationFrame(predictLoop);
}

// Actualizar las predicciones en la interfaz
function updatePredictions(predictions) {
    let maxProb = 0;
    let maxClass = '';
    
    predictions.forEach(pred => {
        const className = pred.className.toLowerCase();
        const probability = (pred.probability * 100).toFixed(0);
        
        // Actualizar valores individuales
        if (className.includes('arriba') || className.includes('up')) {
            document.getElementById('predUp').textContent = probability + '%';
        } else if (className.includes('abajo') || className.includes('down')) {
            document.getElementById('predDown').textContent = probability + '%';
        } else if (className.includes('izquierda') || className.includes('left')) {
            document.getElementById('predLeft').textContent = probability + '%';
        } else if (className.includes('derecha') || className.includes('right')) {
            document.getElementById('predRight').textContent = probability + '%';
        }
        
        // Encontrar la predicción más alta
        if (pred.probability > maxProb) {
            maxProb = pred.probability;
            maxClass = pred.className;
        }
    });
    
    // Actualizar indicador de dirección
    if (maxProb > 0.5) {
        directionValue.textContent = maxClass;
        confidenceFill.style.width = (maxProb * 100) + '%';
        
        // Cambiar color según confianza
        if (maxProb > 0.8) {
            confidenceFill.style.background = 'linear-gradient(90deg, #00b894, #00cec9)';
        } else if (maxProb > 0.6) {
            confidenceFill.style.background = 'linear-gradient(90deg, #fdcb6e, #f7931e)';
        } else {
            confidenceFill.style.background = 'linear-gradient(90deg, #ff7675, #ff6b35)';
        }
    } else {
        directionValue.textContent = '---';
        confidenceFill.style.width = '0%';
    }
}

// Cambiar dirección de la serpiente basado en predicción
function changeDirectionFromPrediction(predictions) {
    let maxProb = 0;
    let maxClass = '';
    
    predictions.forEach(pred => {
        if (pred.probability > maxProb) {
            maxProb = pred.probability;
            maxClass = pred.className.toLowerCase();
        }
    });
    
    // Solo cambiar si la confianza es mayor al 50% (más sensible)
    if (maxProb < 0.5) return;
    
    // Cambiar dirección según la clase detectada
    // Buscar palabras clave en español e inglés
    if (maxClass.includes('arriba') || maxClass.includes('up') || maxClass === 'arriba' || maxClass === 'up') {
        if (lastDirection.y !== 1) {
            velocityX = 0;
            velocityY = -1;
            lastDirection = { x: 0, y: -1 };
        }
    } else if (maxClass.includes('abajo') || maxClass.includes('down') || maxClass === 'abajo' || maxClass === 'down') {
        if (lastDirection.y !== -1) {
            velocityX = 0;
            velocityY = 1;
            lastDirection = { x: 0, y: 1 };
        }
    } else if (maxClass.includes('izquierda') || maxClass.includes('left') || maxClass === 'izquierda' || maxClass === 'left') {
        if (lastDirection.x !== 1) {
            velocityX = -1;
            velocityY = 0;
            lastDirection = { x: -1, y: 0 };
        }
    } else if (maxClass.includes('derecha') || maxClass.includes('right') || maxClass === 'derecha' || maxClass === 'right') {
        if (lastDirection.x !== -1) {
            velocityX = 1;
            velocityY = 0;
            lastDirection = { x: 1, y: 0 };
        }
    }
}

// Detener la cámara
function stopCamera() {
    if (webcam) {
        webcam.stop();
    }
    if (predictionLoop) {
        cancelAnimationFrame(predictionLoop);
    }
    cameraInitialized = false;
}

// ========== CONTROL DE MODOS ==========

// Cambiar a modo teclado
keyboardModeBtn.addEventListener('click', () => {
    cameraEnabled = false;
    stopCamera();
    cameraSection.style.display = 'none';
    keyboardModeBtn.classList.add('active');
    cameraModeBtn.classList.remove('active');
    instructionsElement.innerHTML = '<p>Usa las flechas del teclado para mover la serpiente</p>';
});

// Cambiar a modo cámara
cameraModeBtn.addEventListener('click', async () => {
    cameraEnabled = true;
    cameraSection.style.display = 'block';
    cameraModeBtn.classList.add('active');
    keyboardModeBtn.classList.remove('active');
    instructionsElement.innerHTML = '<p>Mueve tu cuerpo frente a la cámara para controlar la serpiente</p><p class="instructions-small">También puedes usar las flechas del teclado</p>';
    
    if (!cameraInitialized) {
        await initCamera();
    } else {
        predictionLoop = requestAnimationFrame(predictLoop);
    }
});

// Event listeners para botones
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

// Dibujar estado inicial
const initialGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
initialGradient.addColorStop(0, '#74b9ff');
initialGradient.addColorStop(1, '#a29bfe');
ctx.fillStyle = initialGradient;
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.fillStyle = '#fff';
ctx.font = 'bold 24px Arial';
ctx.textAlign = 'center';
ctx.shadowBlur = 10;
ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
ctx.fillText('Presiona "Iniciar Juego"', canvas.width / 2, canvas.height / 2);
ctx.shadowBlur = 0;

// Inicializar cámara al cargar la página (modo por defecto)
window.addEventListener('load', async () => {
    if (cameraEnabled) {
        await initCamera();
    }
});
