let content = document.querySelector(".content");
let bot = document.querySelector(".bot");
let pts = document.querySelector(".pts");
let best = document.querySelector(".best");
let audio = document.getElementById("music");
let game = document.querySelector(".game");
let rst = document.querySelector(".rst");
let game_over = false;

let audioCtx, analyser, dataArray;
let score = 0;
let speed = 1500;
let lastSpawn = 0;
let delay = 500;

alert(
  "dans info y a les pts dans la partie et best score\nvous pouvez changer le background et l'audio\nactualiser si vous reseter"
);

// Vérif portrait
function check() {
  document.getElementById("warning").style.display = window.matchMedia(
    "(orientation: portrait)"
  ).matches
    ? "block"
    : "none";
}
window.addEventListener("load", check);
window.addEventListener("resize", check);

// Upload image
document
  .getElementById("image-upload")
  .addEventListener("change", function (e) {
    let file = e.target.files[0];
    const preview = document.getElementById("preview");
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = function (ev) {
        preview.src = ev.target.result;
        preview.style.display = "flex";
        game.style.backgroundImage = `url(${ev.target.result})`;
      };
      reader.readAsDataURL(file);
    }
  });

// Upload audio
document.getElementById("file-upload").addEventListener("change", function (e) {
  let file = e.target.files[0];
  if (file && file.type.startsWith("audio/")) {
    audio.src = URL.createObjectURL(file);
  }
});

// Load image/audio/best
function loadImage() {
  if (localStorage.getItem("image")) {
    preview.src = localStorage.getItem("image");
    game.style.backgroundImage = `url(${localStorage.getItem("image")})`;
  }
}
function loadAudio() {
  if (localStorage.getItem("audio")) {
    audio.src = localStorage.getItem("audio");
    audio.load();
  }
}
function loadBest() {
  if (localStorage.getItem("best"))
    best.innerHTML = localStorage.getItem("best");
}
document.addEventListener("DOMContentLoaded", () => {
  loadImage();
  loadAudio();
  loadBest();
});

// Reset
rst.onclick = function () {
  if (localStorage.getItem("image")) localStorage.removeItem("image");
  if (localStorage.getItem("audio")) localStorage.removeItem("audio");
};

// Bouton rejouer
function createBot() {
  let newBot = document.createElement("div");
  newBot.classList.add("bot");
  newBot.onclick = startGame;
  content.appendChild(newBot);
}
bot.onclick = startGame;

// Start game
function startGame() {
  game_over = false;
  content.classList.add("active");
  pts.innerHTML = "0";
  score = 0;
  speed = 1500;
  lastSpawn = 0;

  if (document.querySelector(".bot")) document.querySelector(".bot").remove();
  content.innerHTML = "";

  audio.pause();
  audio.currentTime = 0;
  audio.play();

  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  analyser = audioCtx.createAnalyser();
  let source = audioCtx.createMediaElementSource(audio);
  source.connect(analyser);
  analyser.connect(audioCtx.destination);

  analyser.fftSize = 256;
  dataArray = new Uint8Array(analyser.frequencyBinCount);

  detectBeat();
}

// Détection beats → création cible
function detectBeat() {
  if (game_over) return;

  analyser.getByteFrequencyData(dataArray);
  let bass = dataArray.slice(0, 10).reduce((a, b) => a + b, 0) / 10;
  let now = performance.now();

  if (bass > 180 && now - lastSpawn > delay) {
    let x = Math.random() * (content.clientHeight - 80);
    let y = Math.random() * (content.clientWidth - 80);

    spawnTarget(x, y);

    lastSpawn = now;
  }

  requestAnimationFrame(detectBeat);
}

// Création d'une cible
function spawnTarget(top, left) {
  if (game_over) return;

  let target = document.createElement("div");
  target.classList.add("target");
  target.style.top = top + "px";
  target.style.left = left + "px";
  content.appendChild(target);

  target.onclick = function () {
    if (game_over) return;
    target.remove();
    score++;
    if (parseInt(best.textContent) < score) {
      best.innerHTML = score;
      localStorage.setItem("best", score);
    }
    pts.innerHTML = score;
  };

  setTimeout(() => {
    if (content.contains(target) && !game_over) {
      target.remove();
      game_over = true;
      content.innerHTML = "Jeu terminé ! Vous avez raté un target.";
      audio.pause();
      audio.currentTime = 0;
      createBot();
    }
  }, speed);
}
