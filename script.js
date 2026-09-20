const answers = {
  1: [
    "a t-rex playing video games",
    "a trex playing video games",
    "a t rex playing video games"
  ],

  2: [
    "a house floating in the sky lifted by party balloons"
  ],

  3: [
    "a koala hugging a giant chocolate bar"
  ],

  4: [
    "a knight riding on a giant garden snail"
  ],

  5: [
    "a city made of stacked waffles and syrup"
  ]
};


let currentRound = 1;
let unlockedRounds = 3;

let confettiInterval = null;


const roundTitle =
  document.getElementById("round-title");

const roundBadge =
  document.getElementById("round-badge");

const answerInput =
  document.getElementById("answer");

const answerForm =
  document.getElementById("answer-form");

const feedback =
  document.getElementById("feedback");

const correctMessage =
  document.getElementById("correct-message");

const newRoundButton =
  document.getElementById("new-round");

const extraRounds =
  document.getElementById("extra-rounds");

const confetti =
  document.getElementById("confetti");


/* ========================================
   ANSWER NORMALIZATION
======================================== */

/*
  Ignore:
  - Capitalization
  - Punctuation

  Do NOT ignore:
  - Spaces
  - Word order
  - Missing words
*/

function normalizeAnswer(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[.,!?;:'"()[\]{}\-]/g, "");
}


/* ========================================
   CHECK ANSWER
======================================== */

function isCorrect(userAnswer, acceptedAnswers) {

  const normalizedUserAnswer =
    normalizeAnswer(userAnswer);

  return acceptedAnswers.some((answer) => {
    return (
      normalizedUserAnswer ===
      normalizeAnswer(answer)
    );
  });
}


/* ========================================
   CORRECT STATE
======================================== */

function setCorrectState() {

  document.body.classList.add("correct");

  correctMessage.classList.add("show");

  correctMessage.setAttribute(
    "aria-hidden",
    "false"
  );

  feedback.textContent = "";

  feedback.className = "feedback";

  launchConfetti();
}


/* ========================================
   CLEAR CORRECT STATE
======================================== */

function clearCorrectState() {

  document.body.classList.remove("correct");

  correctMessage.classList.remove("show");

  correctMessage.setAttribute(
    "aria-hidden",
    "true"
  );

  stopConfetti();
}


/* ========================================
   CHECK CURRENT ANSWER
======================================== */

function checkAnswer() {

  clearCorrectState();


  const correct =
    isCorrect(
      answerInput.value,
      answers[currentRound]
    );


  if (correct) {

    setCorrectState();

  } else {

    feedback.textContent =
      "Not quite! Try again.";

    feedback.className =
      "feedback incorrect";
  }
}


/* ========================================
   SWITCH ROUND
======================================== */

function selectRound(roundNumber) {

  currentRound = roundNumber;


  roundTitle.textContent =
    `Round ${roundNumber}`;

  roundBadge.textContent =
    `ROUND ${roundNumber}`;


  answerInput.value = "";


  feedback.textContent = "";

  feedback.className =
    "feedback";


  /*
    Switching rounds clears the
    success state and confetti.
  */

  clearCorrectState();


  document
    .querySelectorAll(".round-button")
    .forEach((button) => {

      button.classList.toggle(
        "active",
        Number(button.dataset.round) ===
          roundNumber
      );

    });


  /*
    Deliberately do not focus the textarea.
    On iPad, automatically focusing it could
    immediately open the keyboard.
  */
}


/* ========================================
   CREATE NEW ROUND BUTTON
======================================== */

function createRoundButton(roundNumber) {

  const button =
    document.createElement("button");


  button.type = "button";

  button.className =
    "round-button";

  button.dataset.round =
    roundNumber;

  button.textContent =
    `Round ${roundNumber}`;


  button.addEventListener(
    "click",
    () => selectRound(roundNumber)
  );


  return button;
}


/* ========================================
   EXISTING ROUND BUTTONS
======================================== */

document
  .querySelectorAll(".round-button")
  .forEach((button) => {

    button.addEventListener(
      "click",
      () =>
        selectRound(
          Number(button.dataset.round)
        )
    );

  });


/* ========================================
   NEW ROUND BUTTON
======================================== */

newRoundButton.addEventListener(
  "click",
  () => {

    if (unlockedRounds >= 5) {
      return;
    }


    unlockedRounds += 1;


    const button =
      createRoundButton(unlockedRounds);


    extraRounds.appendChild(button);


    /*
      Once Round 5 is unlocked,
      there are no more rounds to add.
    */

    if (unlockedRounds >= 5) {

      newRoundButton.hidden = true;

    }

  }
);


/* ========================================
   SUBMIT ANSWER
======================================== */

answerForm.addEventListener(
  "submit",
  (event) => {

    event.preventDefault();

    checkAnswer();

  }
);


/* ========================================
   CREATE CONFETTI
======================================== */

function createConfettiBurst() {

  const pieces = 45;


  for (let i = 0; i < pieces; i += 1) {

    const piece =
      document.createElement("span");


    piece.className =
      "confetti-piece";


    /*
      Random pastel-ish HSL colors.
    */

    const hue =
      Math.floor(Math.random() * 360);

    const saturation =
      35 +
      Math.floor(Math.random() * 35);

    const lightness =
      45 +
      Math.floor(Math.random() * 25);


    piece.style.left =
      `${Math.random() * 100}%`;


    piece.style.backgroundColor =
      `hsl(${hue} ${saturation}% ${lightness}%)`;


    piece.style.setProperty(
      "--drift",
      `${-180 + Math.random() * 360}px`
    );


    piece.style.setProperty(
      "--rotation",
      `${-540 + Math.random() * 1080}deg`
    );


    piece.style.animationDelay =
      `${Math.random() * 0.5}s`;


    confetti.appendChild(piece);


    /*
      Remove each piece after it finishes
      falling so the DOM doesn't grow forever.
    */

    piece.addEventListener(
      "animationend",
      () => {
        piece.remove();
      }
    );

  }
}


/* ========================================
   START PERSISTENT CONFETTI
======================================== */

function launchConfetti() {

  /*
    Prevent multiple intervals from
    running at the same time.
  */

  stopConfetti();


  createConfettiBurst();


  /*
    Keep generating new bursts until
    the user switches to another round.
  */

  confettiInterval =
    window.setInterval(
      () => {
        createConfettiBurst();
      },
      1200
    );
}


/* ========================================
   STOP CONFETTI
======================================== */

function stopConfetti() {

  if (confettiInterval !== null) {

    window.clearInterval(
      confettiInterval
    );

    confettiInterval = null;
  }


  confetti.replaceChildren();
}