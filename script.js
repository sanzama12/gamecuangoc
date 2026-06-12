// ===== QUESTIONS DATA =====
const questions = [
    {
        question: "Welchen Abschluss bekommt man nach der Realschule?",
        answers: [
            { label: "A", text: "Abitur" },
            { label: "B", text: "Hauptschulabschluss" },
            { label: "C", text: "Mittlere Reife (Realschulabschluss)" },
            { label: "D", text: "Doktortitel" }
        ],
        correct: 2
    },
    {
        question: "Welche Klassen besucht man normalerweise im Gymnasium?",
        answers: [
            { label: "A", text: "Klassen 1–4" },
            { label: "B", text: "Klassen 5–12 oder 13" },
            { label: "C", text: "Klassen 5–8" },
            { label: "D", text: "Klassen 10–11" }
        ],
        correct: 1
    },
    {
        question: "Was ist eine Realschule?",
        answers: [
            { label: "A", text: "Eine Universität" },
            { label: "B", text: "Eine Grundschule" },
            { label: "C", text: "Eine Schulform zwischen Hauptschule und Gymnasium" },
            { label: "D", text: "Ein Kindergarten" }
        ],
        correct: 2
    },
    {
        question: "Was ist ein Vorteil des Gymnasiums?",
        answers: [
            { label: "A", text: "Die Schüler haben weniger Unterricht als andere Schüler." },
            { label: "B", text: "Die Schüler können nach dem Abitur an einer Universität studieren." },
            { label: "C", text: "Die Schüler müssen keine Prüfungen machen." },
            { label: "D", text: "Die Schüler lernen keine Fremdsprachen." }
        ],
        correct: 1
    }
];

// ===== GAME STATE =====
let currentQuestion = 0;
let score = 0;
let lives = 3;
let correctCount = 0;
let wrongCount = 0;
let answered = false;
let timerInterval = null;
let timeLeft = 60;
const TIME_LIMIT = 60;

// ===== DOM ELEMENTS =====
const startScreen = document.getElementById('startScreen');
const gameScreen = document.getElementById('gameScreen');
const endScreen = document.getElementById('endScreen');

const scoreDisplay = document.getElementById('scoreDisplay');
const questionNum = document.getElementById('questionNum');
const progressBar = document.getElementById('progressBar');
const qBadge = document.getElementById('qBadge');
const questionText = document.getElementById('questionText');
const answersContainer = document.getElementById('answersContainer');
const btnNext = document.getElementById('btnNext');

const timerBar = document.getElementById('timerBar');
const timerValue = document.getElementById('timerValue');
const transitionOverlay = document.getElementById('transitionOverlay');
const transitionNum = document.getElementById('transitionNum');
const transitionBar = document.getElementById('transitionBar');

document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('btnRestart').addEventListener('click', restartGame);
btnNext.addEventListener('click', goNext);

// ===== START GAME =====
function startGame() {
    startScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    endScreen.classList.add('hidden');
    loadQuestion();
}

// ===== LOAD QUESTION =====
function loadQuestion() {
    if (currentQuestion >= questions.length || lives <= 0) {
        endGame();
        return;
    }

    answered = false;
    btnNext.classList.add('hidden');

    const q = questions[currentQuestion];

    // Update stats
    questionNum.textContent = `${currentQuestion + 1} / ${questions.length}`;
    qBadge.textContent = currentQuestion + 1;
    progressBar.style.width = `${(currentQuestion / questions.length) * 100}%`;

    // Animate card
    const card = document.getElementById('questionCard');
    card.style.animation = 'none';
    card.offsetHeight;
    card.style.animation = 'fadeSlideUp 0.45s ease-out';

    // Set question
    questionText.textContent = q.question;

    // Build answer buttons
    answersContainer.innerHTML = '';
    q.answers.forEach((ans, idx) => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.id = `answer-${idx}`;
        btn.innerHTML = `
            <span class="label">${ans.label}</span>
            <span class="text">${ans.text}</span>
        `;
        btn.addEventListener('click', () => handleAnswer(idx));
        answersContainer.appendChild(btn);
    });

    // Start 60-second timer
    startTimer();
}

// ===== TIMER =====
function startTimer() {
    stopTimer();
    timeLeft = TIME_LIMIT;
    updateTimerUI();

    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerUI();

        if (timeLeft <= 0) {
            stopTimer();
            handleTimeUp();
        }
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function updateTimerUI() {
    const pct = (timeLeft / TIME_LIMIT) * 100;
    timerBar.style.width = pct + '%';
    timerValue.textContent = timeLeft;

    // Reset classes
    timerBar.classList.remove('warning', 'danger');
    timerValue.classList.remove('warning', 'danger');

    if (timeLeft <= 10) {
        timerBar.classList.add('danger');
        timerValue.classList.add('danger');
    } else if (timeLeft <= 20) {
        timerBar.classList.add('warning');
        timerValue.classList.add('warning');
    }
}

function handleTimeUp() {
    if (answered) return;
    answered = true;

    const q = questions[currentQuestion];
    const allBtns = answersContainer.querySelectorAll('.answer-btn');
    const correctBtn = allBtns[q.correct];

    // Disable all buttons
    allBtns.forEach(btn => btn.disabled = true);

    // Show correct answer
    correctBtn.classList.add('is-correct');

    // Dim all others
    allBtns.forEach((btn, i) => {
        if (i !== q.correct) btn.classList.add('dimmed');
    });

    // Lose a life
    wrongCount++;
    lives--;

    const heartEl = document.getElementById(`heart${lives + 1}`);
    if (heartEl) {
        heartEl.classList.add('breaking');
        setTimeout(() => heartEl.classList.add('lost'), 500);
    }

    // Show next or end
    setTimeout(() => {
        if (lives <= 0) {
            endGame();
        } else {
            btnNext.classList.remove('hidden');
            if (currentQuestion >= questions.length - 1) {
                btnNext.textContent = 'Xem kết quả 🏁';
            } else {
                btnNext.textContent = 'Câu tiếp theo →';
            }
        }
    }, 800);
}

// ===== HANDLE ANSWER =====
function handleAnswer(selectedIdx) {
    if (answered) return;

    const q = questions[currentQuestion];
    const allBtns = answersContainer.querySelectorAll('.answer-btn');
    const selectedBtn = allBtns[selectedIdx];

    if (selectedIdx === q.correct) {
        // === CORRECT ===
        answered = true;
        stopTimer();

        // Disable all buttons
        allBtns.forEach(btn => btn.disabled = true);

        selectedBtn.classList.add('is-correct');
        score += 10;
        correctCount++;
        scoreDisplay.textContent = score;

        // Dim other answers
        allBtns.forEach((btn, i) => {
            if (i !== selectedIdx) btn.classList.add('dimmed');
        });

        // Show +10 floating
        showScoreFly('+10');

        // Show next button after delay (or end)
        setTimeout(() => {
            btnNext.classList.remove('hidden');
            if (currentQuestion >= questions.length - 1) {
                btnNext.textContent = 'Xem kết quả 🏁';
            } else {
                btnNext.textContent = 'Câu tiếp theo →';
            }
        }, 800);
    } else {
        // === WRONG ===
        // Hide only this wrong answer so user can guess again
        selectedBtn.classList.add('wrong-hidden');
        selectedBtn.disabled = true;
        
        wrongCount++;
        lives--;

        // Break heart animation
        const heartEl = document.getElementById(`heart${lives + 1}`);
        if (heartEl) {
            heartEl.classList.add('breaking');
            setTimeout(() => heartEl.classList.add('lost'), 500);
        }

        // If no lives left, game over
        if (lives <= 0) {
            answered = true;
            stopTimer();

            // Disable all buttons
            allBtns.forEach(btn => btn.disabled = true);

            // Highlight the correct answer since they failed
            const correctBtn = allBtns[q.correct];
            if (correctBtn) {
                correctBtn.classList.add('is-correct');
            }

            // Dim others
            allBtns.forEach((btn, i) => {
                if (i !== q.correct) btn.classList.add('dimmed');
            });

            // End game after a short delay
            setTimeout(() => {
                endGame();
            }, 1200);
        }
    }
}

// ===== GO NEXT (with 3s transition) =====
function goNext() {
    btnNext.classList.add('hidden');
    stopTimer();
    currentQuestion++;

    if (currentQuestion >= questions.length || lives <= 0) {
        endGame();
        return;
    }

    // Show transition overlay
    transitionNum.textContent = currentQuestion + 1;
    transitionOverlay.classList.remove('hidden');

    // Reset and animate loader bar
    transitionBar.classList.remove('animate');
    transitionBar.style.width = '0%';
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            transitionBar.classList.add('animate');
        });
    });

    // After 3 seconds, hide overlay and load next question
    setTimeout(() => {
        transitionOverlay.classList.add('hidden');
        transitionBar.classList.remove('animate');
        transitionBar.style.width = '0%';
        loadQuestion();
    }, 3000);
}

// ===== SCORE FLY =====
function showScoreFly(text) {
    const el = document.createElement('div');
    el.className = 'score-fly';
    el.textContent = text;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1100);
}

// ===== END GAME =====
function endGame() {
    stopTimer();
    gameScreen.classList.add('hidden');

    // Determine trophy data based on score
    const maxScore = questions.length * 10;
    let trophyIcon, trophyTitle, trophySub;

    if (score === maxScore) {
        trophyIcon = '🏆';
        trophyTitle = '🎉 Xuất sắc! 🎉';
        trophySub = 'Bạn đã chinh phục đỉnh núi Gymnasium!';
    } else if (score >= 30) {
        trophyIcon = '🥈';
        trophyTitle = '🎊 Rất giỏi! 🎊';
        trophySub = 'Gần đến đỉnh rồi!';
    } else if (score >= 20) {
        trophyIcon = '🥉';
        trophyTitle = '👏 Khá tốt! 👏';
        trophySub = 'Bạn đã hoàn thành thử thách!';
    } else if (score >= 10) {
        trophyIcon = '📖';
        trophyTitle = '📚 Hoàn thành!';
        trophySub = 'Hãy học thêm và thử lại nhé!';
    } else {
        trophyIcon = '💪';
        trophyTitle = '⏱️ Kết thúc!';
        trophySub = 'Đừng bỏ cuộc, hãy thử lại!';
    }

    // Show trophy overlay
    const overlay = document.getElementById('trophyOverlay');
    const introIcon = document.getElementById('trophyIntroIcon');
    const introText = document.getElementById('trophyText');
    const introSub = document.getElementById('trophySub');
    const introScore = document.getElementById('trophyScoreNum');

    introIcon.textContent = trophyIcon;
    introText.textContent = trophyTitle;
    introSub.textContent = trophySub;

    // Reset overlay animation state
    overlay.classList.remove('fade-out');
    overlay.classList.remove('hidden');

    // Animate score counting up
    animateScoreCount(introScore, 0, score, 1200, 800);

    // Launch confetti immediately
    launchConfetti();

    // After 3.5 seconds, fade out overlay and show end screen
    setTimeout(() => {
        overlay.classList.add('fade-out');

        setTimeout(() => {
            overlay.classList.add('hidden');
            overlay.classList.remove('fade-out');
            showEndScreen();
        }, 600);
    }, 3500);
}

// ===== ANIMATE SCORE COUNT =====
function animateScoreCount(element, from, to, duration, delay) {
    setTimeout(() => {
        const startTime = performance.now();
        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(from + (to - from) * eased);
            element.textContent = current;
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        requestAnimationFrame(update);
    }, delay);
}

// ===== SHOW END SCREEN (after intro) =====
function showEndScreen() {
    document.getElementById('endScore').textContent = score;
    document.getElementById('endCorrect').textContent = correctCount;
    document.getElementById('endWrong').textContent = wrongCount;
    document.getElementById('endLives').textContent = lives;

    const endIcon = document.getElementById('endIcon');
    const endTitle = document.getElementById('endTitle');
    const endMessage = document.getElementById('endMessage');

    const maxScore = questions.length * 10;

    if (score === maxScore) {
        endIcon.textContent = '🏆';
        endTitle.textContent = 'Xuất sắc! Chinh phục đỉnh núi!';
        endMessage.textContent = 'Tuyệt vời! Bạn đã trả lời đúng tất cả câu hỏi. Bạn là chuyên gia về hệ thống giáo dục Đức! 🎓';
    } else if (score >= 30) {
        endIcon.textContent = '🥈';
        endTitle.textContent = 'Rất giỏi! Gần đến đỉnh rồi!';
        endMessage.textContent = 'Bạn đã thể hiện rất tốt! Chỉ cần cố gắng thêm một chút nữa thôi. 💪';
    } else if (score >= 20) {
        endIcon.textContent = '🥉';
        endTitle.textContent = 'Khá tốt! Tiếp tục cố gắng!';
        endMessage.textContent = 'Bạn đã có kiến thức cơ bản. Hãy thử lại để leo lên cao hơn nhé! 📚';
    } else if (score >= 10) {
        endIcon.textContent = '📖';
        endTitle.textContent = 'Cần học thêm!';
        endMessage.textContent = 'Đừng nản chí! Hãy tìm hiểu thêm về hệ thống giáo dục Đức và thử lại nhé. 🌟';
    } else {
        endIcon.textContent = '💪';
        endTitle.textContent = 'Hãy thử lại!';
        endMessage.textContent = 'Mỗi lần thử là một cơ hội để học hỏi. Đọc lại kiến thức và chinh phục đỉnh núi! 🏔️';
    }

    endScreen.classList.remove('hidden');
    progressBar.style.width = '100%';
}

// ===== CONFETTI =====
function launchConfetti() {
    const box = document.getElementById('confettiBox');
    box.innerHTML = '';
    const colors = ['#6366f1', '#f59e0b', '#16a34a', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316'];

    for (let i = 0; i < 50; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti';
        const size = 6 + Math.random() * 10;
        piece.style.left = Math.random() * 100 + '%';
        piece.style.width = size + 'px';
        piece.style.height = size + 'px';
        piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        piece.style.setProperty('--dur', (2 + Math.random() * 2) + 's');
        piece.style.setProperty('--delay', Math.random() * 1.2 + 's');
        piece.style.setProperty('--rot', (Math.random() * 720 - 360) + 'deg');
        piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
        box.appendChild(piece);
    }

    setTimeout(() => { box.innerHTML = ''; }, 5000);
}

// ===== RESTART =====
function restartGame() {
    currentQuestion = 0;
    score = 0;
    lives = 3;
    correctCount = 0;
    wrongCount = 0;
    answered = false;

    stopTimer();

    scoreDisplay.textContent = '0';
    progressBar.style.width = '0%';
    btnNext.classList.add('hidden');
    transitionOverlay.classList.add('hidden');

    // Reset timer UI
    timerBar.style.width = '100%';
    timerBar.classList.remove('warning', 'danger');
    timerValue.textContent = TIME_LIMIT;
    timerValue.classList.remove('warning', 'danger');

    // Reset hearts
    for (let i = 1; i <= 3; i++) {
        const h = document.getElementById(`heart${i}`);
        h.className = 'heart-icon';
    }

    // Clear confetti & trophy overlay
    document.getElementById('confettiBox').innerHTML = '';
    document.getElementById('trophyOverlay').classList.add('hidden');

    endScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');

    loadQuestion();
}
