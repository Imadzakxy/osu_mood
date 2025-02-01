const gameContainer = document.getElementById('gameContainer');
const startBtn = document.getElementById('startBtn');
const scoreElement = document.getElementById('score');
const gameAudio = document.getElementById('gameAudio');

let score = 0;
let gameInterval;
let holdTimers = {};
let isGameActive = false;



function startGame() {
    resetGame();
    isGameActive = true;
    startBtn.disabled = true;
    gameAudio.play();
    gameInterval = setInterval(createRandomTarget, 1500);
}

function createRandomTarget() {
    if(!isGameActive) return;

    const types = ['normal', 'moving', 'hold'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    switch(type) {
        case 'normal':
            createNormalTarget();
            break;
        case 'moving':
            createMovingTarget();
            break;
        case 'hold':
            createHoldTarget();
            break;
    }
}

function createNormalTarget() {
    const target = document.createElement('div');
    target.className = 'target normal';
    target.textContent = 'CLIC';
    positionElement(target);
    
    target.addEventListener('click', () => {
        if(!isGameActive) return;
        target.remove();
        updateScore(10);
    });

    gameContainer.appendChild(target);
}

function createMovingTarget() {
    const target = document.createElement('div');
    target.className = 'target moving';
    target.textContent = '→→→';
    const startPos = positionElement(target);
    const endPos = getRandomPosition();

    const animation = target.animate([
        { transform: `translate(${startPos.x}px, ${startPos.y}px)` },
        { transform: `translate(${endPos.x}px, ${endPos.y}px)` }
    ], {
        duration: 4000,
        easing: 'linear'
    });

    animation.onfinish = () => {
        if(target.parentElement) gameOver();
    };

    target.addEventListener('click', () => {
        if(!isGameActive) return;
        animation.cancel();
        target.remove();
        updateScore(20);
    });

    gameContainer.appendChild(target);
}

function createHoldTarget() {
    const target = document.createElement('div');
    target.className = 'target hold';
    target.innerHTML = `
        <div>TENIR</div>
        <div class="progress-bar">
            <div class="progress"></div>
        </div>
    `;

    const progress = target.querySelector('.progress');
    positionElement(target);

    let holdTime = 0;
    const targetId = Date.now().toString();
    
    target.onmousedown = () => {
        if(!isGameActive) return;
        holdTimers[targetId] = setInterval(() => {
            holdTime += 10;
            progress.style.width = `${(holdTime / 1000) * 100}%`;
            if(holdTime >= 1000) {
                clearInterval(holdTimers[targetId]);
                target.remove();
                updateScore(30);
            }
        }, 10);
    };

    target.onmouseup = () => {
        if(!isGameActive) return;
        clearInterval(holdTimers[targetId]);
        progress.style.width = '0%';
        holdTime = 0;
    };

    gameContainer.appendChild(target);
}

function positionElement(element) {
    const pos = getRandomPosition();
    element.style.left = pos.x + 'px';
    element.style.top = pos.y + 'px';
    return pos;
}

function getRandomPosition() {
    return {
        x: Math.random() * (gameContainer.offsetWidth - 60),
        y: Math.random() * (gameContainer.offsetHeight - 60)
    };
}

function updateScore(points) {
    score += points;
    scoreElement.textContent = `Score: ${score}`;
}

function gameOver() {
    isGameActive = false;
    clearInterval(gameInterval);
    gameAudio.pause();
    alert(`Game Over! Score: ${score}`);
    resetGame();
}

function resetGame() {
    gameContainer.innerHTML = '';
    score = 0;
    scoreElement.textContent = 'Score: 0';
    startBtn.disabled = false;
    holdTimers = {};
    isGameActive = false;
}