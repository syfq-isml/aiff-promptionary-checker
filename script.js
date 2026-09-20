const answers = {
  1: "a t-rex playing video games",
  2: "a house floating in the sky lifted by party balloons",
  3: "a koala hugging a giant chocolate bar",
  4: "a knight riding on a giant garden snail",
  5: "a city made of stacked waffles and syrup"
};

let currentRound = 1;
let unlockedRounds = 3;

const roundTitle = document.getElementById("round-title");
const roundBadge = document.getElementById("round-badge");
const answerInput = document.getElementById("answer");
const answerForm = document.getElementById("answer-form");
const feedback = document.getElementById("feedback");
const correctMessage = document.getElementById("correct-message");
const newRoundButton = document.getElementById("new-round");
const extraRounds = document.getElementById("extra-rounds");
const confetti = document.getElementById("confetti");

function normalizeAnswer(value) {
  // Capitalization and punctuation are ignored.
  // Whitespace is intentionally preserved so missing/extra spaces matter.
  return value
    .trim()
    .toLowerCase()
    .replace(/[.,!?;:'"()[\]{}\-]/g, "");
}

function isCorrect(userAnswer, answerKey) {
  return normalizeAnswer(userAnswer) === normalizeAnswer(answerKey);
}

function setCorrectState() {
  document.body.classList.add("correct");
  correctMessage.classList.add("show");
  correctMessage.setAttribute("aria-hidden", "false");
  feedback.textContent = "";
  feedback.className = "feedback";
  launchConfetti();
}

function clearCorrectState() {
  document.body.classList.remove("correct");
  correctMessage.classList.remove("show");
  correctMessage.setAttribute("aria-hidden", "true");
}

function checkAnswer() {
  clearCorrectState();

  if (isCorrect(answerInput.value, answers[currentRound])) {
    setCorrectState();
  } else {
    feedback.textContent = "Not quite! Try again.";
    feedback.className = "feedback incorrect";
  }
}

function selectRound(roundNumber) {
  currentRound = roundNumber;
  roundTitle.textContent = `Round ${roundNumber}`;
  roundBadge.textContent = `ROUND ${roundNumber}`;
  answerInput.value = "";
  feedback.textContent = "";
  feedback.className = "feedback";
  clearCorrectState();
  answerInput.focus();

  document.querySelectorAll(".round-button").forEach((button) => {
    button.classList.toggle(
      "active",
      Number(button.dataset.round) === roundNumber
    );
  });
}

function createRoundButton(roundNumber) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "round-button";
  button.dataset.round = roundNumber;
  button.textContent = `Round ${roundNumber}`;
  button.addEventListener("click", () => selectRound(roundNumber));
  return button;
}

document.querySelectorAll(".round-button").forEach((button) => {
  button.addEventListener("click", () => {
    selectRound(Number(button.dataset.round));
  });
});

newRoundButton.addEventListener("click", () => {
  if (unlockedRounds >= 5) return;

  unlockedRounds += 1;
  const button = createRoundButton(unlockedRounds);
  extraRounds.appendChild(button);

  if (unlockedRounds >= 5) {
    newRoundButton.hidden = true;
  }
});

answerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  checkAnswer();
});

function launchConfetti() {
  confetti.replaceChildren();

  const pieces = 70;

  for (let i = 0; i < pieces; i += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";

    const hue = Math.floor(Math.random() * 360);
    const saturation = 35 + Math.floor(Math.random() * 35);
    const lightness = 45 + Math.floor(Math.random() * 25);

    piece.style.left = `${Math.random() * 100}%`;
    piece.style.backgroundColor = `hsl(${hue} ${saturation}% ${lightness}%)`;
    piece.style.setProperty("--drift", `${-180 + Math.random() * 360}px`);
    piece.style.setProperty("--rotation", `${-540 + Math.random() * 1080}deg`);
    piece.style.animationDelay = `${Math.random() * 0.35}s`;
    piece.style.transform = `rotate(${Math.random() * 180}deg)`;

    confetti.appendChild(piece);
  }

  window.setTimeout(() => {
    confetti.replaceChildren();
  }, 3000);
}
