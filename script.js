let content = document.querySelector('.content');
let bot = document.querySelector('.bot');
let pts = document.querySelector('.pts');
let game_over = false;

bot.onclick = function() {
    startGame();
};

function startGame() {
    let i = 0;
    let j = 2000;
    game_over = false;
    
    bot.remove();
    content.innerHTML = '';


    let audio = document.getElementById('background-music');
    audio.play();
    
    let interval = setInterval(function() {
        if (game_over) {
            clearInterval(interval);
            let newBot = document.createElement('div');
            newBot.classList.add('bot');
            newBot.onclick = startGame;
            content.appendChild(newBot);
            audio.pause();
            audio.currentTime = 0;
            return;
        }

        let target = document.createElement('div');
        target.classList.add('target');
        
        target.style.top = Math.random() * (content.clientHeight - 60) + 'px';
        target.style.left = Math.random() * (content.clientWidth - 60) + 'px';
        
        content.appendChild(target);

        target.onclick = function() {
            target.remove();
            i++;
            pts.innerHTML = `${i}`;
        };

        setTimeout(function() {
            if (content.contains(target)) {
                target.remove();
                game_over = true;
                content.innerHTML = "Jeu terminé ! Vous avez raté un target.";
            }
        }, j);
        j = Math.max( 500, j - 50);
    }, j);
}
