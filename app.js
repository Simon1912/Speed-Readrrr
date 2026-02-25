const wordElement = document.getElementById('word');
const textInput = document.getElementById('textInput');

const playBtn = document.getElementById('playBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const resetBtn = document.getElementById('resetBtn');
const loadBtn = document.getElementById('loadBtn');
const clearBtn = document.getElementById('clearBtn');

const wpm = document.getElementById('wpm');
const wpmLabel = document.getElementById('wpmLabel');
const pos = document.getElementById('pos');

const KEY = "speedreader_v2";

let words = [];
let index = 0;
let timer = null;
let playing = false;

function tokenize(text) {
  // keep paragraph breaks as a token "\n"
  return text
    .replace(/\n+/g, " \n ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);
}

function renderWord(word) {
  if (!word) return "";
  if (word === "\n") return "<span class='small'>—</span>";

  const mid = Math.floor(word.length / 2);
  return word.slice(0, mid) +
    '<span class="orp">' + word[mid] + '</span>' +
    word.slice(mid + 1);
}

function msPerWordFromWpm(wpmVal) {
  return Math.round(60000 / wpmVal);
}

function updateUI() {
  const total = words.length;
  pos.textContent = total ? `${Math.min(index + 1, total)} / ${total}` : `0 / 0`;
  wordElement.innerHTML = total ? renderWord(words[index] || "") : "Ready";
}

function saveState() {
  const state = { text: textInput.value, index, wpm: Number(wpm.value) };
  localStorage.setItem(KEY, JSON.stringify(state));
}

function loadState() {
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); }
  catch { return {}; }
}

function stop() {
  playing = false;
  playBtn.textContent = "▶ Start";
  if (timer) clearTimeout(timer);
  timer = null;
  saveState();
}

function getAdaptiveDelay(word, baseDelay) {
  let multiplier = 1;

  // paragraph token
  if (word === "\n") multiplier += 1.2;

  // long words
  if (word.length >= 8) multiplier += 0.25;
  if (word.length >= 12) multiplier += 0.15;

  // comma / semicolon
  if (/[,;:]/.test(word)) multiplier += 0.4;

  // sentence end
  if (/[.!?]/.test(word)) multiplier += 0.7;

  return Math.round(baseDelay * multiplier);
}

function tick() {
  if (!playing) return;

  if (index < words.length - 1) {
    const currentWord = words[index];
    index++;
    updateUI();
    saveState();

    const baseDelay = msPerWordFromWpm(Number(wpm.value));
    const adaptiveDelay = getAdaptiveDelay(currentWord, baseDelay);

    timer = setTimeout(tick, adaptiveDelay);
  } else {
    stop();
  }
}

function start() {
  if (!words.length) return;
  if (playing) return;
  playing = true;
  playBtn.textContent = "⏸ Pause";
  updateUI();

  const baseDelay = msPerWordFromWpm(Number(wpm.value));
  const firstDelay = getAdaptiveDelay(words[index] || "", baseDelay);

  timer = setTimeout(tick, firstDelay);
}

// Buttons
playBtn.addEventListener("click", () => (playing ? stop() : start()));

prevBtn.addEventListener("click", () => {
  stop();
  index = Math.max(index - 1, 0);
  updateUI();
  saveState();
});

nextBtn.addEventListener("click", () => {
  stop();
  index = Math.min(index + 1, Math.max(words.length - 1, 0));
  updateUI();
  saveState();
});

resetBtn.addEventListener("click", () => {
  stop();
  index = 0;
  updateUI();
  saveState();
});

loadBtn.addEventListener("click", () => {
  stop();
  words = tokenize(textInput.value);
  index = 0;
  updateUI();
  saveState();
});

clearBtn.addEventListener("click", () => {
  stop();
  textInput.value = "";
  words = [];
  index = 0;
  updateUI();
  saveState();
});

wpm.addEventListener("input", () => {
  wpmLabel.textContent = wpm.value;
  saveState();
  if (playing) {
    stop();
    start();
  }
});

// Init
const st = loadState();
textInput.value = st.text || "";
wpm.value = st.wpm || 300;
wpmLabel.textContent = wpm.value;

words = tokenize(textInput.value);
index = Math.min(st.index || 0, Math.max(words.length - 1, 0));
updateUI();
