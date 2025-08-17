let content = document.querySelector(".content");
let bot = document.querySelector(".bot");
let pts = document.querySelector(".pts");
let best = document.querySelector(".best");
let audio = document.getElementById("music");
let game = document.querySelector(".game");
let rst = document.querySelector(".rst");
let game_over = false;

let audioCtx;
let analyser;
let dataArray;
let bufferLength;
let mapping = []; // tableau des beats détectés
let currentHash = null;
let useMapping = false;

alert(
  "dans info y a les pts dans la partie et best score\nvous pouvez changer le background et l'audio\nactualiser si vous reseter"
);

// ⚡ Hash SHA-256 du fichier
async function getHash(file) {
  const buf = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function check() {
  if (window.matchMedia("(orientation: portrait)").matches) {
    document.getElementById("warning").style.display = "block";
  } else {
    document.getElementById("warning").style.display = "none";
  }
}

window.addEventListener("load", check);
window.addEventListener("resize", check);

document
  .getElementById("image-upload")
  .addEventListener("change", function (event) {
    let file = event.target.files[0];
    const preview = document.getElementById("preview");

    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = function (e) {
        preview.src = e.target.result;
        preview.style.display = "flex";
        game.style.backgroundImage = `url(${e.target.result})`;
        localStorage.setItem("image", preview.src);
      };
      reader.readAsDataURL(file);
    }
  });

document
  .getElementById("file-upload")
  .addEventListener("change", async function (event) {
    let file = event.target.files[0];
    if (file && file.type.startsWith("audio/")) {
      audio.src = URL.createObjectURL(file);

      // ⚡ Calcul hash du fichier
      currentHash = await getHash(file);

      // Vérifie si un mapping existe déjà
      if (localStorage.getItem(currentHash)) {
        mapping = JSON.parse(localStorage.getItem(currentHash));
        useMapping = true;
      } else {
        mapping = [];
        useMapping = false;
      }

      localStorage.setItem("audio", audio.src);
    }
  });

function loadimage() {
  if (localStorage.getItem("image")) {
    preview.src = localStorage.getItem("image");
    game.style.backgroundImage = `url(${localStorage.getItem("image")})`;
  }
}

function loadaudio() {
  if (localStorage.getItem("audio")) {
    audio.src = localStorage.getItem("audio");
    audio.load();
  }
}

function loadbest() {
  if (localStorage.getItem("best")) {
    best.innerHTML = `${localStorage.getItem("best")}`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadimage();
  loadaudio();
  loadbest();
});

rst.onclick = function () {
  if (localStorage.getItem("image")) localStorage.removeItem("image");
  if (localStorage.getItem("audio")) localStorage.removeItem("audio");
  if (currentHash) localStorage.removeItem(currentHash);
};

function createBotButton() {
  let newBot = document.createElement("div");
  newBot.classList.add("bot");
  newBot.onclick = startGame;
  content.appendChild(newBot);
}

bot.onclick = function () {
  startGame();
};

function startGame() {
  game_over = false;
  content.classList.add("active");
  pts.innerHTML = "0";
  i = 0;
  speed = 1500;
  lastSpawn = 0;

  if (document.querySelector(".bot")) {
    document.querySelector(".bot").remove();
  }
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
  bufferLength = analyser.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength);

  // ⚡ soit on rejoue le mapping sauvegardé, soit on analyse en live
  if (useMapping && mapping.length > 0) {
    playFromMapping();
  } else {
    detectBeat();
  }
}

let i = 0;
let speed = 1500;
let lastSpawn = 0;
let spawnDelay = 500;

function detectBeat() {
  if (game_over) return;

  analyser.getByteFrequencyData(dataArray);

  let bass = dataArray.slice(0, 10).reduce((a, b) => a + b, 0) / 10;
  let now = performance.now();

  if (bass > 180 && now - lastSpawn > spawnDelay) {
    let time = audio.currentTime;
    let x = Math.random() * (content.clientHeight - 80);
    let y = Math.random() * (content.clientWidth - 80);

    spawnTarget(x, y);

    // Sauvegarde dans mapping
    mapping.push({ time, x, y });
    localStorage.setItem(currentHash, JSON.stringify(mapping));

    lastSpawn = now;
  }

  requestAnimationFrame(detectBeat);
}

function playFromMapping() {
  let idx = 0;

  function step() {
    if (game_over || idx >= mapping.length) return;
    if (audio.currentTime >= mapping[idx].time) {
      spawnTarget(mapping[idx].x, mapping[idx].y);
      idx++;
    }
    requestAnimationFrame(step);
  }

  step();
}

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
    i++;
    if (parseInt(best.textContent) < i) {
      best.innerHTML = `${i}`;
      localStorage.setItem("best", i);
    }
    pts.innerHTML = `${i}`;
    speed = Math.max(500, speed - 20);
  };

  setTimeout(() => {
    if (content.contains(target) && !game_over) {
      target.remove();
      game_over = true;
      content.innerHTML = "Jeu terminé ! Vous avez raté un target.";
      audio.pause();
      audio.currentTime = 0;
      createBotButton();
    }
  }, speed);
}
