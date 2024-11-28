const canvas = document.getElementById('gameCanvas');
const fullscreenButton = document.getElementById('fullscreenButton');
const ctx = canvas.getContext('2d');
const menu = document.getElementById('menu');
const startButton = document.getElementById('start');
const sizeSlider = document.getElementById('sizeSlider');
const sizePreview = document.getElementById('sizePreview');
const bgMusic = document.getElementById('bgMusic');
const previewAudio = document.getElementById('previewAudio');
const previewMusicButton = document.getElementById('previewMusic');

window.onload = () => {
    const savedTheme = localStorage.getItem('theme') || 'default';
    document.getElementById('theme').value = savedTheme;
    applyTheme(savedTheme);

    document.getElementById('target').value = 'rat';
    targetType = 'rat';
    // Retrieve target size from localStorage or set default
    const savedSize = localStorage.getItem('targetSize') || '50';
    sizeSlider.value = savedSize;
    targetSize = savedSize;
    sizePreview.style.width = `${targetSize}px`;
    sizePreview.style.height = `${targetSize}px`;
    sizePreview.style.backgroundImage = `url('${targetImages[targetType]}')`;
};

document.getElementById('theme').addEventListener('change', (e) => {
    const selectedTheme = e.target.value;
    localStorage.setItem('theme', selectedTheme);
    applyTheme(selectedTheme);
});

function applyTheme(theme) {
    document.body.className = `${theme}-theme`;
    const header = document.querySelector('header');
    const footer = document.querySelector('footer');
    if (header) header.className = `${theme}-theme`;
    if (footer) footer.className = `${theme}-theme`;
    updateCanvasBackground(theme);
}

function updateCanvasBackground(theme) {
    if (theme === 'default') {
        canvas.style.backgroundColor = '#f0f8ff';
    } else if (theme === 'dark') {
        canvas.style.backgroundColor = '#1c1c1c';
    } else if (theme === 'sea') {
        canvas.style.backgroundColor = '#2ea9dd';
    } else if (theme === 'leaves') {
        canvas.style.backgroundColor = '#e8f5e9';
    }
}

let targetType = 'rat';
let targetSize = 200;
let targets = [];
let running = false;

const targetImages = {
    rat: 'assets/images/rat.png',
    bug: 'assets/images/bug.png',
    butterfly: 'assets/images/butterfly.png',
    fish: 'assets/images/fish.png'
};
const targetSounds = {
    rat: 'assets/sounds/rat.mp3',
    bug: 'assets/sounds/bug.mp3',
    butterfly: 'assets/sounds/cricket.mp3',
    fish: 'assets/sounds/bell.mp3'
};

const musicTracks = {
    track1: 'assets/sounds/wave.mp3',
    track2: 'assets/sounds/bird-flap.mp3'
};

document.getElementById('target').addEventListener('change', (e) => {
    targetType = e.target.value;
    sizePreview.style.backgroundImage = `url('${targetImages[targetType]}')`;
});

sizeSlider.addEventListener('input', (e) => {
    targetSize = e.target.value;
    localStorage.setItem('targetSize', targetSize); 
    sizePreview.style.width = `${targetSize}px`;
    sizePreview.style.height = `${targetSize}px`;
});

previewMusicButton.addEventListener('click', () => {
    const musicChoice = document.getElementById('music').value;
    if (musicChoice === 'none') return;
    previewAudio.src = musicTracks[musicChoice];
    previewAudio.play();
});

startButton.addEventListener('click', () => {
    const musicChoice = document.getElementById('music').value;
    if (musicChoice !== 'none') {
        bgMusic.src = musicTracks[musicChoice];
        bgMusic.play();
    }
    menu.style.display = 'none';
    canvas.style.display = 'block';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.requestFullscreen();
    running = true;
    spawnTarget();
    gameLoop();
});

function exitFullScreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    }
}

fullscreenButton.addEventListener('click', () => {
    if (!document.fullscreenElement) {
        enterFullScreen();
        fullscreenButton.style.display = 'none';
    } else {
        exitFullScreen();
    }
});

function enterFullScreen() {
    if (canvas.requestFullscreen) {
        canvas.requestFullscreen();
    } else if (canvas.mozRequestFullScreen) {
        canvas.mozRequestFullScreen();
    } else if (canvas.webkitRequestFullscreen) {
        canvas.webkitRequestFullscreen();
    } else if (canvas.msRequestFullscreen) {
        canvas.msRequestFullscreen();
    }
}

document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
        fullscreenButton.style.display = 'block';
    }
});

document.addEventListener('webkitfullscreenchange', () => {
    if (!document.webkitFullscreenElement) {
        fullscreenButton.style.display = 'block';
    }
});

document.addEventListener('mozfullscreenchange', () => {
    if (!document.mozFullScreenElement) {
        fullscreenButton.style.display = 'block';
    }
});

document.addEventListener('msfullscreenchange', () => {
    if (!document.msFullscreenElement) {
        fullscreenButton.style.display = 'block';
    }
});

function spawnTarget() {
    const img = new Image();
    img.src = targetImages[targetType];
    const target = {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        dx: (Math.random() - 0.5) * 4,
        dy: (Math.random() - 0.5) * 4,
        angle: 0,
        spin: Math.random() < 0.3 ? (Math.random() - 0.5) * 0.1 : 0,
        img: img
    };
    targets.push(target);
    setTimeout(spawnTarget, 1000);
}

function updateTargets() {
    for (const target of targets) {
        target.x += target.dx;
        target.y += target.dy;
        target.angle += target.spin;
        if (target.x < 0 || target.x > canvas.width - targetSize) target.dx *= -1;
        if (target.y < 0 || target.y > canvas.height - targetSize) target.dy *= -1;
    }
}

function drawTargets() {
    for (const target of targets) {
        ctx.save();
        ctx.translate(target.x + targetSize / 2, target.y + targetSize / 2);
        ctx.rotate(target.angle);
        ctx.drawImage(target.img, -targetSize / 2, -targetSize / 2, targetSize, targetSize);
        ctx.restore();
    }
}

canvas.addEventListener('click', (event) => {
    const clickX = event.clientX;
    const clickY = event.clientY;

    targets = targets.filter(target => {
        const isHit = clickX >= target.x && clickX <= target.x + targetSize &&
                      clickY >= target.y && clickY <= target.y + targetSize;

        if (isHit) {
            const sound = new Audio(targetSounds[targetType]);
            sound.play();
        }
        return !isHit; // Remove target if hit
    });
});

function gameLoop() {
    if (!running) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updateTargets();
    drawTargets();
    requestAnimationFrame(gameLoop);
}
