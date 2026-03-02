let puzzles = [];
let unlockedCount = 1; // First clue unlocked by default
let currentPuzzleIndex = 0;

const clueList = document.getElementById("clueList");
const puzzleText = document.getElementById("puzzleText");
const submitButton = document.getElementById("submitAnswer");
const answerInput = document.getElementById("answerInput");

/* =========================
   Local Storage Handling
========================= */

function loadProgress() {
    const savedUnlocked = localStorage.getItem("unlockedCount");
    if (savedUnlocked !== null) {
        unlockedCount = Math.max(1, parseInt(savedUnlocked));
    } else {
        unlockedCount = 1;
    }
}

function saveProgress() {
    localStorage.setItem("unlockedCount", unlockedCount);
}

function saveAnswer(index, answer) {
    localStorage.setItem("answer_" + index, answer);
}

function loadAnswer(index) {
    return localStorage.getItem("answer_" + index) || "";
}

/* =========================
   Rendering
========================= */

function renderClues() {
    clueList.innerHTML = "";

    for (let i = 0; i < unlockedCount; i++) {
        const li = document.createElement("li");
        li.textContent = puzzles[i].title;
        li.onclick = () => loadPuzzle(i);

        if (i === currentPuzzleIndex) {
            li.classList.add("active");
        }

        clueList.appendChild(li);
    }
}

function loadPuzzle(index) {
    currentPuzzleIndex = index;
    puzzleText.textContent = puzzles[index].text;
    answerInput.value = loadAnswer(index);

    renderClues();
}

/* =========================
   Summary Page
========================= */

function showSummaryPage() {
    clueList.innerHTML = "";
    answerInput.style.display = "none";
    submitButton.style.display = "none";

    let summaryText = "All clues completed:\n\n";

    for (let i = 0; i < puzzles.length; i++) {
        const ans = loadAnswer(i) || "(no answer)";
        summaryText += puzzles[i].title + ": " + ans + "\n\n";
    }

    puzzleText.textContent = summaryText;
}

/* =========================
   Submit Logic
========================= */

submitButton.addEventListener("click", () => {
    const answer = answerInput.value.trim();
    if (!answer) return;

    saveAnswer(currentPuzzleIndex, answer);

    // Unlock next clue if on latest unlocked
    if (
        currentPuzzleIndex === unlockedCount - 1 &&
        unlockedCount < puzzles.length
    ) {
        unlockedCount++;
        saveProgress();
    }

    // If all clues unlocked → show summary
    if (unlockedCount === puzzles.length) {
        showSummaryPage();
    } else {
        renderClues();
    }
});

/* =========================
   Load JSON
========================= */

fetch("./puzzles.json")
    .then(response => response.json())
    .then(data => {
        puzzles = data.puzzles;

        loadProgress();

        if (unlockedCount === puzzles.length) {
            showSummaryPage();
        } else {
            renderClues();
            loadPuzzle(0);
        }
    })
    .catch(error => {
        console.error("Failed to load puzzles:", error);
    });

/* =========================
   Console Reset Command
========================= */

window.resetGame = function () {
    localStorage.clear();
    location.reload();
};
