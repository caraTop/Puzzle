let puzzles = [];
let unlockedCount = 1;
let currentView = "clue"; // "clue" or "summary"
let currentPuzzleIndex = 0;

const clueList = document.getElementById("clueList");
const puzzleText = document.getElementById("puzzleText");
const submitButton = document.getElementById("submitAnswer");
const answerInput = document.getElementById("answerInput");

/* =========================
   Local Storage
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
   Rendering Sidebar
========================= */

function allAnswered() {
    for (let i = 0; i < unlockedCount; i++) {
        if (!loadAnswer(i)) return false;
    }
    return true;
}

function renderClues() {
    clueList.innerHTML = "";

    // Render unlocked clues
    for (let i = 0; i < unlockedCount; i++) {
        const li = document.createElement("li");
        li.textContent = puzzles[i].title;

        if (currentView === "clue" && i === currentPuzzleIndex) {
            li.classList.add("active");
        }

        li.onclick = () => {
            currentView = "clue";
            loadPuzzle(i);
        };

        clueList.appendChild(li);
    }

    // Show Summary only if all unlocked clues have answers
    if (allAnswered()) {
        const summaryItem = document.createElement("li");
        summaryItem.textContent = "Summary";
        summaryItem.classList.add("summary");

        if (currentView === "summary") {
            summaryItem.classList.add("active");
        }

        summaryItem.onclick = () => {
            currentView = "summary";
            showSummary();
            renderClues();
        };

        clueList.appendChild(summaryItem);
    }
}

/* =========================
   Load Puzzle
========================= */

function loadPuzzle(index) {
    currentPuzzleIndex = index;
    puzzleText.textContent = puzzles[index].text;
    answerInput.style.display = "block";
    submitButton.style.display = "block";
    answerInput.value = loadAnswer(index);
    renderClues();
}

/* =========================
   Summary View
========================= */

function showSummary() {
    answerInput.style.display = "none";
    submitButton.style.display = "none";

    let summaryText = "Clue Answers:\n\n";

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

    if (
        currentPuzzleIndex === unlockedCount - 1 &&
        unlockedCount < puzzles.length
    ) {
        unlockedCount++;
        saveProgress();
    }

    renderClues();
});

/* =========================
   Load JSON
========================= */

fetch("./puzzles.json")
    .then(response => response.json())
    .then(data => {
        puzzles = data.puzzles;

        loadProgress();
        renderClues();
        loadPuzzle(0);
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
