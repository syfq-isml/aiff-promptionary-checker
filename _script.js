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

const phraseDisplay =
  document.getElementById("phrase-display");

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
   PHRASE DISPLAY
======================================== */

/*
  The first accepted answer is used as the
  canonical phrase for the hangman display.

  For example:

  "a t-rex playing video games"

  becomes:

  "_ _-___ ______ _____ _____"
*/

function getCanonicalAnswer() {
  return answers[currentRound][0];
}


/*
  Normalize an individual word.

  This removes punctuation so that:

  "t-rex"
  "trex"

  can be compared when determining which
  words should be revealed.
*/

function normalizeWord(word) {
  return word
    .toLowerCase()
    .replace(/[.,!?;:'"()[\]{}\-]/g, "");
}


/*
  Render the current phrase.

  revealedWords contains words that the user
  has correctly guessed.

  revealAll is used when the entire phrase
  has been correctly guessed.
*/

function renderPhrase(
  revealedWords = [],
  revealAll = false
) {

  const canonicalAnswer =
    getCanonicalAnswer();

  const words =
    canonicalAnswer.split(" ");

  phraseDisplay.replaceChildren();

  words.forEach((word, index) => {

    const wordElement =
      document.createElement("span");

    wordElement.className =
      "phrase-word";

    const normalizedWord =
      normalizeWord(word);

    const shouldReveal =
      revealAll ||
      revealedWords.includes(normalizedWord);


    if (shouldReveal) {

      wordElement.textContent =
        word;

    } else {

      /*
        Replace letters/numbers with "_",
        while preserving punctuation.

        Example:

        t-rex

        becomes:

        _-___
      */

      wordElement.textContent =
        [...word]
          .map((character) =>
            /[a-z0-9]/i.test(character)
              ? "_"
              : character
          )
          .join("");
    }


    phraseDisplay.appendChild(
      wordElement
    );


    /*
      Add a normal space between words.
    */

    if (index < words.length - 1) {

      phraseDisplay.appendChild(
        document.createTextNode(" ")
      );
    }
  });


  phraseDisplay.setAttribute(
    "aria-label",
    revealAll
      ? canonicalAnswer
      : "Phrase with some words hidden"
  );
}


/*
  Determine which words from the phrase have
  been correctly guessed.

  Example:

  User enters:

  "a dinosaur playing games"

  The phrase is:

  "a t-rex playing video games"

  Result:

  "a _-___ playing _____ games"
*/

function getRevealedWords(userAnswer) {

  const guessedWords =
    userAnswer
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean)
      .map(normalizeWord);


  const phraseWords =
    getCanonicalAnswer()
      .split(/\s+/)
      .map(normalizeWord);


  return [
    ...new Set(
      guessedWords.filter((word) =>
        phraseWords.includes(word)
      )
    )
  ];
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

  feedback.className =
    "feedback";


  /*
    Once the complete answer is correct,
    reveal the entire phrase.
  */

  renderPhrase([], true);


  /*
    Start the persistent confetti.
  */

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

  /*
    If the phrase has already been solved,
    do nothing.

    This prevents the CORRECT animation
    and confetti from restarting if the
    user submits again.
  */

  if (
    correctMessage.classList.contains("show")
  ) {
    return;
  }


  const correct =
    isCorrect(
      answerInput.value,
      answers[currentRound]
    );


  /*
    Find any individual words that the
    user's guess got right.
  */

  const revealedWords =
    getRevealedWords(
      answerInput.value
    );


  if (correct) {

    /*
      Only a completely correct phrase
      triggers the success state.
    */

    setCorrectState();

  } else {

    /*
      Reveal any correctly guessed words,
      but keep the rest hidden.
    */

    renderPhrase(
      revealedWords
    );


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

  currentRound =
    roundNumber;


  roundTitle.textContent =
    `Round ${roundNumber}`;


  roundBadge.textContent =
    `ROUND ${roundNumber}`;


  /*
    Clear the previous answer.
  */

  answerInput.value = "";


  /*
    Clear previous feedback.
  */

  feedback.textContent = "";

  feedback.className =
    "feedback";


  /*
    Clear success state and confetti.
  */

  clearCorrectState();


  /*
    Show the new round's phrase
    in its hidden state.
  */

  renderPhrase();


  /*
    Update the active round button.
  */

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

function createRoundButton(
  roundNumber
) {

  const button =
    document.createElement("button");


  button.type =
    "button";


  button.className =
    "round-button";


  button.dataset.round =
    roundNumber;


  button.textContent =
    `Round ${roundNumber}`;


  button.addEventListener(
    "click",
    () =>
      selectRound(roundNumber)
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

    /*
      Maximum of 5 rounds.
    */

    if (unlockedRounds >= 5) {
      return;
    }


    unlockedRounds += 1;


    const button =
      createRoundButton(
        unlockedRounds
      );


    extraRounds.appendChild(
      button
    );


    /*
      Once Round 5 is unlocked,
      hide the New Round button.
    */

    if (unlockedRounds >= 5) {

      newRoundButton.hidden =
        true;
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


  for (
    let i = 0;
    i < pieces;
    i += 1
  ) {

    const piece =
      document.createElement("span");


    piece.className =
      "confetti-piece";


    /*
      Random pastel-ish HSL colors.
    */

    const hue =
      Math.floor(
        Math.random() * 360
      );


    const saturation =
      35 +
      Math.floor(
        Math.random() * 35
      );


    const lightness =
      45 +
      Math.floor(
        Math.random() * 25
      );


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


    confetti.appendChild(
      piece
    );


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

  if (
    confettiInterval !== null
  ) {

    window.clearInterval(
      confettiInterval
    );


    confettiInterval =
      null;
  }


  confetti.replaceChildren();
}


/* ========================================
   INITIAL PHRASE
======================================== */

/*
  Show Round 1's phrase as blanks
  when the page first loads.
*/

renderPhrase();