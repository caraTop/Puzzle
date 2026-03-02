let puzzles = [];
let jsonVersion = "";
let unlockedCount = 1;
let currentView = "clue";
let currentPuzzleIndex = 0;

const clueList = document.getElementById("clueList");
const puzzleText = document.getElementById("puzzleText");
const submitButton = document.getElementById("submitAnswer");
const answerInput = document.getElementById("answerInput");

/* =========================
   Local Storage by Version
========================= */

function storageKey(key) {
    return `${key}_v${jsonVersion}`;
}

function loadProgress() {
    const savedUnlocked = localStorage.getItem(storageKey("unlockedCount"));
    if (savedUnlocked !== null) {
        unlockedCount = Math.max(1, parseInt(savedUnlocked));
    } else {
        unlockedCount = 1;
    }
}

function saveProgress() {
    localStorage.setItem(storageKey("unlockedCount"), unlockedCount);
}

function saveAnswer(index, answer) {
    localStorage.setItem(storageKey("answer_" + index), answer);
}

function loadAnswer(index) {
    return localStorage.getItem(storageKey("answer_" + index)) || "";
}

/* =========================
   Check all unlocked answered
========================= */

function allAnswered() {
    for (let i = 0; i < unlockedCount; i++) {
        if (!loadAnswer(i)) return false;
    }
    return true;
}

/* =========================
   Render Sidebar
========================= */

function renderClues() {
    clueList.innerHTML = "";

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
        jsonVersion = data.version || "1.0";

        loadProgress();
        renderClues();
        loadPuzzle(0);
    })
    .catch(error => {
        console.error("Failed to load puzzles:", error);
    });

/* =========================
   Reset Commands
========================= */

window.resetVersion = function () {
    // Remove all keys for this version
    Object.keys(localStorage).forEach(key => {
        if (key.endsWith("_v" + jsonVersion)) {
            localStorage.removeItem(key);
        }
    });
    location.reload();
};

window.resetGame = function () {
    // Remove all versioned keys
    Object.keys(localStorage).forEach(key => {
        if (key.includes("_v")) {
            localStorage.removeItem(key);
        }
    });
    location.reload();
};
