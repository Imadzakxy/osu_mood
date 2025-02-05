let content = document.querySelector('.content');
let bot = document.querySelector('.bot');
let pts = document.querySelector('.pts');
let game = document.querySelector('.game');
let audio = document.getElementById('music');
let game_over = false;

function check(){
    if(window.matchMedia("(orientation: portrait)").matches) {
        document.getElementById("warning").style.display = "block";
    } else {
        document.getElementById("warning").style.display = "none";
    }
}

window.addEventListener("load",check);
window.addEventListener("resize",check);

document.getElementById('image-upload').addEventListener('change', function(event) {
    let file = event.target.files[0];
    const preview = document.getElementById('preview');
    
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
            game.style.backgroundImage = `url(${e.target.result})`;
            localStorage.setItem('image', preview.src);
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('file-upload').addEventListener('change', function(event) {
    let file = event.target.files[0];

    if (file && file.type.startsWith('audio/')) { 
        const reader = new FileReader();
        reader.onload = function(e) {
            audio.src = URL.createObjectURL(file);
            localStorage.setItem('audio', audio.src); 
        };
        reader.readAsDataURL(file);
    }
    
});

function loadimage() {
    let image = localStorage.getItem('image');
    
    if (image) {
        preview.src = image;
        game.style.backgroundImage = `url(${image})`;
    } 
}

function loadaudio() {
    let music = localStorage.getItem('audio');

    if (music) {
        audio.src = music;
        audio.load();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadimage();
    loadaudio();
});

bot.onclick = function() {
    startGame();
};

function startGame() {
    if(!game_over){
        content.classList.toggle('active');
    }

    audio.play();

    let i = 0;
    let j = 1000;
    let k = 1500;
    game_over = false;
    
    document.querySelector('.bot').remove();
    content.innerHTML = '';
    
    let interval = setInterval(() => {
        if (game_over) {
            clearInterval(interval);
            let newBot = document.createElement('div');
            newBot.classList.add('bot');
            newBot.onclick = startGame;
            audio.pause();
            audio.currentTime = 0;
            content.appendChild(newBot);
            return;
        }

        let target = document.createElement('div');
        target.classList.add('target');
        
        target.style.top = Math.random() * (content.clientHeight - 80) + 'px';
        target.style.left = Math.random() * (content.clientWidth - 80) + 'px';
        
        content.appendChild(target);

        target.onclick = function() {
            target.remove();
            i++;
            pts.innerHTML = `${i}`;
        };

        setTimeout(() => {
            if (content.contains(target)) {
                target.remove();
                game_over = true;
                content.innerHTML = "Jeu terminé ! Vous avez raté un target.";
            }
        }, k);
        k = Math.max( 500, k - 100);

    }, j);
    j = Math.max( 500, j - 50);

    
}