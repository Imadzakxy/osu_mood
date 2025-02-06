let content = document.querySelector('.content');
let bot = document.querySelector('.bot');
let pts = document.querySelector('.pts');
let best = document.querySelector('.best');
let audio = document.getElementById('music');
let game = document.querySelector('.game');
let rst = document.querySelector('.rst');
let game_over = false;

alert("dans info y a les pts dans la partie et best score\nvous pouvez changer le background et l'audio\nactualiser si vous reseter");

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
            preview.style.display = 'flex';
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
    if (localStorage.getItem('image')) {
        preview.src = localStorage.getItem('image');
        game.style.backgroundImage = `url(${localStorage.getItem('image')})`;
    } 
}

function loadaudio() {
    if (localStorage.getItem('audio')) {
        audio.src = localStorage.getItem('audio');
        audio.load();
    }
}

function loadbest() {
    if(localStorage.getItem('best')){
        best.innerHTML = `${localStorage.getItem('best')}`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadimage();
    loadaudio();
    loadbest();
});

rst.onclick = function(){
    if (localStorage.getItem('image')) {
        localStorage.removeItem('image');
    }
    if (localStorage.getItem('audio')) {
        localStorage.removeItem('audio');
    }
}

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
            pts.innerHTML = `${0}`;
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
            if(parseInt(best.textContent)<i){
                best.innerHTML = `${i}`;
                localStorage.setItem('best',i);
            }
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