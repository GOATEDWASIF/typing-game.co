// ==============================
// 1. Phrase List (Grouped by Difficulty)
// ==============================
const wordGroups = {
  short: [
    { text: "Forest" },
    { text: "Tatsumi" },
    { text: "Gecko" },
    { text: "Lizard" },
    { text: "Fireworks" },
    { text: "Young Deer" },
    { text: "Green Grass" },
    { text: "Give it a try" },
    { text: "Go beyond" },
    { text: "Self Log" },
  ],
  medium: [
    { text: "Mountain of Knowledge" },
    { text: "Path of Knowledge" },
    { text: "Garden of Knowledge" },
    { text: "Owasashi Festival" },
    { text: "Just a brief scene" },
    { text: "Sunny Room" },
    { text: "Proactive Learner" },
    { text: "50th Anniversary" },
    { text: "Festival" },
    { text: "Snake infested Hallway" }
  ],
  long: [
    { text: "Principal's 8th Year" },
    { text: "Tatsumi Junior High School" },
    { text: "Joint Exhibition" },
    { text: "Limit one keychain per person" },
    { text: "Mr. Ikeda is a gyaru" },
    { text: "Dried earthworms at the edge of the garden after rain" },
    { text: "The vice principal has a great voice" },
    { text: "Mr. Kondo slips into regional dialect sometimes" },
    { text: "Mr. Owada's back muscles are like Machamp" },
    { text: "The principal's presence is immense" }
  ]
};

const wordSequence = [
  "short", "short", "short",
  "medium", "medium", "medium",
  "long", "long", "long"
];

let wordSequenceIndex = 0;
let unusedWords = { short: [], medium: [], long: [] };

function resetPool(category) {
  unusedWords[category] = [...wordGroups[category]];
}

function getNextWord() {
  const currentCategory = wordSequence[wordSequenceIndex];
  if (!unusedWords[currentCategory] || unusedWords[currentCategory].length === 0) {
    resetPool(currentCategory);
  }
  const pool = unusedWords[currentCategory];
  const randomIndex = Math.floor(Math.random() * pool.length);
  const selectedWord = pool.splice(randomIndex, 1)[0];
  wordSequenceIndex = (wordSequenceIndex + 1) % wordSequence.length;
  return selectedWord;
}

// Audio Elements
const seCorrect = document.getElementById("se-correct");
const seMiss = document.getElementById("se-miss");
const seStart = document.getElementById("se-start");
const seEnd = document.getElementById("se-end");

// Safe sound playback, including browsers that block audio before a user gesture.
const playSE = se => {
  if (!se) return;
  try {
    se.pause();
    se.currentTime = 0;
    const playback = se.play();
    if (playback && typeof playback.catch === "function") playback.catch(() => {});
  } catch (_) { /* Audio failure should never stop gameplay. */ }
};


/* Gentle ambient background music made with Web Audio; starts only after user interaction. */
let ambientAudioContext = null;
let ambientNodes = [];
let ambientMusicOn = false;
function startAmbientMusic() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return false;
  if (!ambientAudioContext) {
    ambientAudioContext = new AudioContextClass();
    const master = ambientAudioContext.createGain();
    master.gain.value = 0.0001;
    master.connect(ambientAudioContext.destination);
    // A slow, warm C-major / A-minor ambient pad.
    [130.81, 164.81, 196.00, 261.63].forEach((frequency, i) => {
      const osc = ambientAudioContext.createOscillator();
      const voice = ambientAudioContext.createGain();
      osc.type = i % 2 ? "sine" : "triangle";
      osc.frequency.value = frequency;
      voice.gain.value = [0.12, 0.085, 0.07, 0.045][i];
      osc.connect(voice); voice.connect(master); osc.start();
      ambientNodes.push(osc, voice);
    });
    const lfo = ambientAudioContext.createOscillator();
    const lfoGain = ambientAudioContext.createGain();
    lfo.frequency.value = 0.08; lfoGain.gain.value = 0.035;
    lfo.connect(lfoGain);
    ambientNodes.push(lfo, lfoGain); lfo.start();
    master.gain.setTargetAtTime(0.045, ambientAudioContext.currentTime, 1.4);
    ambientNodes.push(master);
  } else {
    ambientAudioContext.resume();
    const master = ambientNodes[ambientNodes.length - 1];
    if (master && master.gain) master.gain.setTargetAtTime(0.045, ambientAudioContext.currentTime, 1.2);
  }
  ambientMusicOn = true;
  updateMusicButton();
  return true;
}
function stopAmbientMusic() {
  if (ambientAudioContext && ambientNodes.length) {
    const master = ambientNodes[ambientNodes.length - 1];
    if (master && master.gain) master.gain.setTargetAtTime(0.0001, ambientAudioContext.currentTime, 0.35);
  }
  ambientMusicOn = false;
  updateMusicButton();
}
function updateMusicButton() {
  const button = document.getElementById("music-toggle");
  if (button) {
    button.textContent = ambientMusicOn ? "♫ 音楽：オン" : "♫ 音楽：オフ";
    button.setAttribute("aria-pressed", String(ambientMusicOn));
  }
}
const musicToggle = document.getElementById("music-toggle");
if (musicToggle) musicToggle.addEventListener("click", () => {
  if (ambientMusicOn) stopAmbientMusic();
  else if (!startAmbientMusic()) musicToggle.textContent = "音楽を利用できません";
});


/* Shared contest leaderboard. Deploy google-sheets/Code.gs as a Web App, then paste its URL here. */
const SCORE_SHEET_WEB_APP_URL = window.SCORE_SHEET_WEB_APP_URL || "";
const LOCAL_SCORE_KEY = "tatsumi-typing-contest-scores-v1";
const contestantNameInput = document.getElementById("contestant-name");
const leaderboardList = document.getElementById("leaderboard-list");
const leaderboardStatus = document.querySelector(".leaderboard-status");
function readLocalScores() {
  try { return JSON.parse(localStorage.getItem(LOCAL_SCORE_KEY) || "[]"); } catch (_) { return []; }
}
function renderLeaderboard(rows) {
  if (!leaderboardList) return;
  leaderboardList.replaceChildren();
  const scores = (rows || []).slice().sort((a,b) => Number(b.score)-Number(a.score)).slice(0,10);
  if (!scores.length) {
    const li=document.createElement("li"); li.textContent="まだスコアがありません"; leaderboardList.appendChild(li); return;
  }
  scores.forEach((row,index) => {
    const li=document.createElement("li");
    li.textContent = (index+1)+". "+String(row.name || "参加者")+" · "+Number(row.score || 0)+" pts";
    leaderboardList.appendChild(li);
  });
}
function refreshLeaderboard() {
  renderLeaderboard(readLocalScores());
  if (!SCORE_SHEET_WEB_APP_URL) {
    if (leaderboardStatus) leaderboardStatus.textContent = "端末内のスコアのみです。端末間で共有するにはGoogleスプレッドシートへの接続が必要です。";
    return;
  }
  const callbackName = "__typingScoresCallback";
  window[callbackName] = data => {
    if (data && Array.isArray(data.scores)) {
      renderLeaderboard(data.scores);
      try { localStorage.setItem(LOCAL_SCORE_KEY, JSON.stringify(data.scores)); } catch (_) {}
      if (leaderboardStatus) leaderboardStatus.textContent = "ランキングを更新しました（Googleスプレッドシート）";
    }
    delete window[callbackName];
  };
  const script=document.createElement("script");
  script.src=SCORE_SHEET_WEB_APP_URL+"?action=leaderboard&callback="+callbackName+"&_="+Date.now();
  script.onerror=()=>{ if(leaderboardStatus) leaderboardStatus.textContent="共有ランキングを読み込めませんでした。端末内のスコアを表示しています。"; delete window[callbackName]; script.remove(); };
  document.head.appendChild(script);
}
function submitContestScore(finalScore) {
  const name=(contestantNameInput && contestantNameInput.value || "").trim().replace(/\s+/g," ").slice(0,24);
  if (!name) {
    if (contestantNameInput) { contestantNameInput.focus(); contestantNameInput.classList.add("name-needed"); }
    if (gameOverEl) gameOverEl.textContent += "・スコア送信には参加者名を入力してください。";
    return;
  }
  const entry={name,score:Number(finalScore)||0,language:document.documentElement.lang==="ja"?"Japanese":"English",createdAt:new Date().toISOString()};
  const rows=readLocalScores(); rows.push(entry);
  try { localStorage.setItem(LOCAL_SCORE_KEY,JSON.stringify(rows.slice(-100))); } catch (_) {}
  renderLeaderboard(rows);
  if (!SCORE_SHEET_WEB_APP_URL) {
    if (leaderboardStatus) leaderboardStatus.textContent = "この端末に保存しました。Googleスプレッドシートとの共有は未接続です。";
    return;
  }
  if (leaderboardStatus) leaderboardStatus.textContent = "スコアを送信しています…";
  fetch(SCORE_SHEET_WEB_APP_URL,{method:"POST",mode:"no-cors",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(entry)})
    .then(()=>{ if(leaderboardStatus) leaderboardStatus.textContent="スコアを送信しました。共有ランキングを更新しています…"; window.setTimeout(refreshLeaderboard,1200); })
    .catch(()=>{ if(leaderboardStatus) leaderboardStatus.textContent="Googleスプレッドシートに送信できませんでした。スコアはこの端末に保存されています。"; });
}
if (contestantNameInput) contestantNameInput.addEventListener("input",()=>contestantNameInput.classList.remove("name-needed"));
refreshLeaderboard();

// DOM References
const gamePanel = document.getElementById("game"); // Reference for shaking
const kanjiEl = document.getElementById("kanji");
const kanaEl = document.getElementById("kana"); 
const romajiGuideEl = document.getElementById("romaji-guide"); 
const inputEl = document.getElementById("input");
const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");
const startBtn = document.getElementById("start");
const gameOverEl = document.getElementById("game-over");

// Game States
let currentWord = null;
let targetText = "";
let currentIndex = 0;     
let score = 0;
let time = 60;
let timer;

// Triggers an intense shaking animation on layout errors
function triggerHardShake() {
  if (!gamePanel) return;
  gamePanel.classList.remove("shake");
  void gamePanel.offsetWidth; // Force CSS reflow to re-trigger the animation instantly
  gamePanel.classList.add("shake");
}

function setNewWord() {
  currentWord = getNextWord();
  targetText = currentWord.text;
  currentIndex = 0;

  if (kanjiEl) kanjiEl.textContent = targetText;
  if (kanaEl) kanaEl.textContent = ""; 
  if (inputEl) inputEl.value = "";

  updateNextKeyGuide();
}

function updateNextKeyGuide() {
  if (!romajiGuideEl) return;
  if (currentIndex >= targetText.length) {
    romajiGuideEl.textContent = "";
    return;
  }
  const nextChar = targetText[currentIndex];
  romajiGuideEl.textContent = "次のキー： " + nextChar.toUpperCase();
}

function startGame() {
  if (contestantNameInput && !contestantNameInput.value.trim()) {
    contestantNameInput.focus();
    if (leaderboardStatus) leaderboardStatus.textContent = "開始する前に参加者名を入力してください。";
    return;
  }
  playSE(seStart);
  score = 0;
  time = 60;
  wordSequenceIndex = 0;

  resetPool("short");
  resetPool("medium");
  resetPool("long");

  if (scoreEl) scoreEl.textContent = "スコア：0";
  if (timeEl) timeEl.textContent = "残り時間：60秒";
  if (gameOverEl) gameOverEl.textContent = "";

  if (inputEl) {
    inputEl.disabled = false;
    inputEl.value = "";
    inputEl.placeholder = "";
    inputEl.focus();
  }

  setNewWord();

  clearInterval(timer);
  timer = setInterval(() => {
    time--;
    if (timeEl) timeEl.textContent = "残り時間：" + time + "秒";
    if (time <= 0) {
      clearInterval(timer);
      startResultsCountdown();
    }
  }, 1000);
}

// Handles the new post-match timer countdown
function startResultsCountdown() {
  playSE(seEnd);

  // Instantly lock typing input and hide active phrase boxes
  if (inputEl) {
    inputEl.value = "";
    inputEl.placeholder = "時間切れ！";
    inputEl.disabled = true;
  }
  if (kanjiEl) kanjiEl.textContent = "時間切れ！";
  if (kanaEl) kanaEl.textContent = "";
  if (romajiGuideEl) romajiGuideEl.textContent = "";

  let countdownValue = 5;
  if (gameOverEl) gameOverEl.textContent = `結果発表まで ${countdownValue} 秒...`;

  const countdownInterval = setInterval(() => {
    countdownValue--;
    if (countdownValue > 0) {
      if (gameOverEl) gameOverEl.textContent = `結果発表まで ${countdownValue} 秒...`;
    } else {
      clearInterval(countdownInterval);
      showFinalResults();
    }
  }, 1000);
}

function showFinalResults() {
  let bonus = currentIndex;
  const finalScore = score + bonus;

  if (kanjiEl) kanjiEl.textContent = "ゲーム終了";
  
  if (gameOverEl) {
    if (bonus > 0) {
      gameOverEl.textContent = `あなたのスコア：${finalScore}点（ボーナス +${bonus}点）`;
    } else {
      gameOverEl.textContent = `あなたのスコア：${finalScore}点`;
    }
  }
  submitContestScore(finalScore);
}

// MECHANICAL KEYBOARD INTERCEPT ENGINE
if (inputEl) {
  inputEl.addEventListener("keydown", (event) => {
    if (event.key.length !== 1 || !currentWord || inputEl.disabled) {
      if (event.key === " ") event.preventDefault();
      return;
    }

    event.preventDefault(); // Stop standard slower input buffer rendering

    const pressedKey = event.key;
    const expectedChar = targetText[currentIndex];

    if (pressedKey.toLowerCase() === expectedChar.toLowerCase()) {
      currentIndex++;

      if (currentIndex >= targetText.length) {
        playSE(seCorrect);
        score += targetText.length;
        if (scoreEl) scoreEl.textContent = "スコア：" + score;
        setNewWord();
        return;
      }

      // Auto-space jumper
      if (targetText[currentIndex] === " ") {
        currentIndex++;
      }

      inputEl.value = targetText.slice(0, currentIndex);
      updateNextKeyGuide();
    } else {
      // Mistake: trigger audio AND intense screen vibration
      playSE(seMiss);
      triggerHardShake();
    }
  });
}

if (startBtn) {
  startBtn.addEventListener("click", startGame);
}
