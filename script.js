// ==============================
// 1. お題リスト（難易度グループ分け）
// ==============================
const wordGroups = {
  short: [
    { kana: "もり", kanji: "森" },
    { kana: "たつみ", kanji: "辰巳" },
    { kana: "やもり", kanji: "ヤモリ" },
    { kana: "かなへび", kanji: "カナヘビ" },
    { kana: "はなび", kanji: "花火" },
    { kana: "わかしか", kanji: "若鹿" },
    { kana: "あおくさ", kanji: "青草" },
    { kana: "やってみる", kanji: "やってみる" },
    { kana: "こえてゆけ", kanji: "越えてゆけ" },
    { kana: "じぶんろぐ", kanji: "自分ログ" },
  ],
  medium: [
    { kana: "ちしきのやま", kanji: "知識の山" },
    { kana: "ちしきのみち", kanji: "知識の道" },
    { kana: "ちしきのにわ", kanji: "知識の庭" },
    { kana: "おおわしさい", kanji: "大鷲祭" },
    { kana: "ほんのひとこま", kanji: "ほんの一コマ" },
    { kana: "ひだまりるーむ", kanji: "ひだまりルーム" },
    { kana: "すすんでまなぶひと", kanji: "進んで学ぶ人" },
    { kana: "ごじっしゅうねん", kanji: "五十周年" },
    { kana: "ふぇすてぃばる", kanji: "フェスティバル" },
    { kana: "へびすむろうか", kanji: "ヘビ住む廊下" }
  ],
  long: [
    { kana: "こうちょうはちねんめ", kanji: "校長八年目" },
    { kana: "たつみちゅうがっこう", kanji: "辰巳中学校" },
    { kana: "れんごうてんらんかい", kanji: "連合展覧会" },
    { kana: "きーほるだーはいっこまで", kanji: "キーホルダーは一個まで" },
    { kana: "いけだせんせいはぎゃる", kanji: "池田先生はギャル" },
    { kana: "あめあがりかわいたみみずにわのはし", kanji: "雨上がり 乾いたミミズ 庭のはし" },
    { kana: "ふくこうちょうせんせいのこえはめっちゃいい", kanji: "副校長先生の声はめっちゃいい" },
    { kana: "こんどうせんせいはたまにほうげんがでるじゃけえ", kanji: "近藤先生はたまに方言がでるじゃけえ" },
    { kana: "おおわだせんせいのはいきんはかいりきー", kanji: "大和田先生の背筋はカイリキー" },
    { kana: "こうちょうせんせいのせなかはいだい", kanji: "校長先生の背中は偉大" }
  ]
};

// 出現順序を管理する配列（短3回 → 普通3回 → 長3回）
const wordSequence = [
  "short", "short", "short",
  "medium", "medium", "medium",
  "long", "long", "long"
];

let wordSequenceIndex = 0;

// 未使用のお題を管理するプール
let unusedWords = {
  short: [],
  medium: [],
  long: []
};

// プールをリセット（シャッフル）する関数
function resetPool(category) {
  unusedWords[category] = [...wordGroups[category]];
}

// 被りなしでお題を取得する関数
function getNextWord() {
  const currentCategory = wordSequence[wordSequenceIndex];

  if (unusedWords[currentCategory].length === 0) {
    resetPool(currentCategory);
  }

  const pool = unusedWords[currentCategory];
  const randomIndex = Math.floor(Math.random() * pool.length);
  const selectedWord = pool.splice(randomIndex, 1)[0];

  wordSequenceIndex = (wordSequenceIndex + 1) % wordSequence.length;
  return selectedWord;
}

// ==============================
// 2. ローマ字変換テーブル
// ==============================
const ROMAJI_MAP = {
  "あ": ["a"], "い": ["i"], "う": ["u", "whu"], "え": ["e"], "お": ["o"],
  "か": ["ka"], "き": ["ki"], "く": ["ku"], "け": ["ke"], "こ": ["ko"],
  "さ": ["sa"], "し": ["shi", "si"], "す": ["su"], "せ": ["se"], "そ": ["so"],
  "た": ["ta"], "ち": ["chi", "ti"], "つ": ["tsu", "tu"], "て": ["te"], "と": ["to"],
  "な": ["na"], "に": ["ni"], "ぬ": ["nu"], "ね": ["ne"], "の": ["no"],
  "は": ["ha"], "ひ": ["hi"], "ふ": ["fu", "hu"], "へ": ["he"], "ほ": ["ho"],
  "ま": ["ma"], "み": ["mi"], "む": ["mu"], "め": ["me"], "も": ["mo"],
  "や": ["ya"], "ゆ": ["yu"], "よ": ["yo"],
  "ら": ["ra"], "り": ["ri"], "る": ["ru"], "れ": ["re"], "ろ": ["ro"],
  "わ": ["wa"], "を": ["wo"], "ん": ["nn", "n", "n'", "xn"],
  "が": ["ga"], "ぎ": ["gi"], "ぐ": ["gu"], "げ": ["ge"], "ご": ["go"],
  "ざ": ["za"], "じ": ["ji", "zi"], "ず": ["zu"], "ぜ": ["ze"], "ぞ": ["zo"],
  "だ": ["da"], "ぢ": ["di"], "づ": ["du"], "で": ["de"], "ど": ["do"],
  "ば": ["ba"], "び": ["bi"], "ぶ": ["bu"], "べ": ["be"], "ぼ": ["bo"],
  "ぱ": ["pa"], "ぴ": ["pi"], "ぷ": ["pu"], "ぺ": ["pe"], "ぽ": ["po"],
  
  "きゃ": ["kya"], "きゅ": ["kyu"], "きょ": ["kyo"],
  "しゃ": ["sha", "sya"], "しゅ": ["shu", "syu"], "しょ": ["sho", "syo"], "しぇ": ["she", "sye"],
  "ちゃ": ["cha", "tya"], "ちゅ": ["chu", "tyu"], "ちょ": ["cho", "tyo"], "ちぇ": ["che", "tye"],
  "にゃ": ["nya"], "にゅ": ["nyu"], "にょ": ["nyo"],
  "ひゃ": ["hya"], "ひゅ": ["hyu"], "ひょ": ["hyo"],
  "みゃ": ["mya"], "みゅ": ["myu"], "みょ": ["myo"],
  "りゃ": ["rya"], "りゅ": ["ryu"], "りょ": ["ryo"],
  "ぎゃ": ["gya"], "ぎゅ": ["gyu"], "ぎょ": ["gyo"],
  "じゃ": ["ja", "zya", "jya"], "じゅ": ["ju", "zyu", "jyu"], "じょ": ["jo", "zyo", "jyo"],
  "びゃ": ["bya"], "びゅ": ["byu"], "びょ": ["byo"],
  "ぴゃ": ["pya"], "ぴゅ": ["pyu"], "ぴょ": ["pyo"],
  "ふぁ": ["fa"], "ふぃ": ["fi"], "ふぇ": ["fe"], "ふぉ": ["fo"],
  "てぃ": ["thi"], "でぃ": ["dhi"],
  "ー": ["-"]
};

const SMALL_MAP = {
  "ぁ": ["la", "xa"], "ぃ": ["li", "xi"], "ぅ": ["lu", "xu"], "ぇ": ["le", "xe"], "ぉ": ["lo", "xo"],
  "ゃ": ["lya", "xya"], "ゅ": ["lyu", "xyu"], "ょ": ["lyo", "xyo"],
  "っ": ["ltu", "xtu", "ltsu"]
};

// 効果音
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
    button.textContent = ambientMusicOn ? "♫ Music: On" : "♫ Music: Off";
    button.setAttribute("aria-pressed", String(ambientMusicOn));
  }
}
const musicToggle = document.getElementById("music-toggle");
if (musicToggle) musicToggle.addEventListener("click", () => {
  if (ambientMusicOn) stopAmbientMusic();
  else if (!startAmbientMusic()) musicToggle.textContent = "Music unavailable";
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
    const li=document.createElement("li"); li.textContent="No scores yet"; leaderboardList.appendChild(li); return;
  }
  scores.forEach((row,index) => {
    const li=document.createElement("li");
    li.textContent = (index+1)+". "+String(row.name || "Player")+" · "+Number(row.score || 0)+" pts";
    leaderboardList.appendChild(li);
  });
}
function refreshLeaderboard() {
  renderLeaderboard(readLocalScores());
  if (!SCORE_SHEET_WEB_APP_URL) {
    if (leaderboardStatus) leaderboardStatus.textContent = "Local scores only · connect the Google Sheet to share scores across devices.";
    return;
  }
  const callbackName = "__typingScoresCallback";
  window[callbackName] = data => {
    if (data && Array.isArray(data.scores)) {
      renderLeaderboard(data.scores);
      try { localStorage.setItem(LOCAL_SCORE_KEY, JSON.stringify(data.scores)); } catch (_) {}
      if (leaderboardStatus) leaderboardStatus.textContent = "Live contest leaderboard · Google Sheets";
    }
    delete window[callbackName];
  };
  const script=document.createElement("script");
  script.src=SCORE_SHEET_WEB_APP_URL+"?action=leaderboard&callback="+callbackName+"&_="+Date.now();
  script.onerror=()=>{ if(leaderboardStatus) leaderboardStatus.textContent="Could not load the shared leaderboard. Local scores are still shown."; delete window[callbackName]; script.remove(); };
  document.head.appendChild(script);
}
function submitContestScore(finalScore) {
  const name=(contestantNameInput && contestantNameInput.value || "").trim().replace(/\s+/g," ").slice(0,24);
  if (!name) {
    if (contestantNameInput) { contestantNameInput.focus(); contestantNameInput.classList.add("name-needed"); }
    if (gameOverEl) gameOverEl.textContent += " · Enter your name to submit your score.";
    return;
  }
  const entry={name,score:Number(finalScore)||0,language:document.documentElement.lang==="ja"?"Japanese":"English",createdAt:new Date().toISOString()};
  const rows=readLocalScores(); rows.push(entry);
  try { localStorage.setItem(LOCAL_SCORE_KEY,JSON.stringify(rows.slice(-100))); } catch (_) {}
  renderLeaderboard(rows);
  if (!SCORE_SHEET_WEB_APP_URL) {
    if (leaderboardStatus) leaderboardStatus.textContent = "Saved on this device. Google Sheets sharing is not connected yet.";
    return;
  }
  if (leaderboardStatus) leaderboardStatus.textContent = "Submitting score to the contest sheet…";
  fetch(SCORE_SHEET_WEB_APP_URL,{method:"POST",mode:"no-cors",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(entry)})
    .then(()=>{ if(leaderboardStatus) leaderboardStatus.textContent="Score sent to Google Sheets. Refreshing shared rankings…"; window.setTimeout(refreshLeaderboard,1200); })
    .catch(()=>{ if(leaderboardStatus) leaderboardStatus.textContent="Could not send to Google Sheets. Your score is saved on this device."; });
}
if (contestantNameInput) contestantNameInput.addEventListener("input",()=>contestantNameInput.classList.remove("name-needed"));
refreshLeaderboard();

// DOM
const kanjiEl = document.getElementById("kanji");
const kanaEl = document.getElementById("kana");
const romajiGuideEl = document.getElementById("romaji-guide");
const inputEl = document.getElementById("input");
const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");
const startBtn = document.getElementById("start");
const gameOverEl = document.getElementById("game-over");

// 状態
let currentWord = null;
let kanaTokens = [];    
let tokenIndex = 0;     
let currentInput = "";  
let typedRomajiHistory = ""; 
let score = 0;
let time = 60;
let timer;

// 16文字での強制改行を無効化し、CSS側に改行処理を任せる
function splitTextEveryN(text, n = 16) {
  return text;
}

function parseKana(kanaStr) {
  const tokens = [];
  let i = 0;
  while (i < kanaStr.length) {
    const two = kanaStr.slice(i, i + 2);
    if (ROMAJI_MAP[two]) {
      tokens.push(two);
      i += 2;
    } else {
      tokens.push(kanaStr[i]);
      i += 1;
    }
  }
  return tokens;
}

function getCandidates(token, nextToken) {
  let patterns = [];

  if (ROMAJI_MAP[token]) {
    patterns = [...ROMAJI_MAP[token]];
  } else if (SMALL_MAP[token]) {
    patterns = [...SMALL_MAP[token]];
  } else {
    patterns = [token];
  }

  if (token === "っ" && nextToken) {
    const nextCandidates = getCandidates(nextToken, null);
    nextCandidates.forEach(cand => {
      const firstChar = cand[0];
      if (!["a", "i", "u", "e", "o", "n", "-"].includes(firstChar)) {
        if (!patterns.includes(firstChar)) {
          patterns.unshift(firstChar);
        }
      }
    });
  }

  return patterns;
}

function setNewWord() {
  currentWord = getNextWord();
  kanaTokens = parseKana(currentWord.kana);
  tokenIndex = 0;
  currentInput = "";
  typedRomajiHistory = "";

  kanjiEl.innerHTML = splitTextEveryN(currentWord.kanji, 16);
  kanaEl.innerHTML = splitTextEveryN(currentWord.kana, 16);
  inputEl.value = "";

  updateNextKeyGuide();
}

function updateNextKeyGuide() {
  if (tokenIndex >= kanaTokens.length) {
    romajiGuideEl.textContent = "";
    return;
  }

  const curToken = kanaTokens[tokenIndex];
  const nextToken = kanaTokens[tokenIndex + 1] || null;
  const candidates = getCandidates(curToken, nextToken);

  const matched = candidates.filter(c => c.startsWith(currentInput));

  if (matched.length > 0) {
    const recommended = matched[0];
    const nextChar = recommended[currentInput.length];
    romajiGuideEl.textContent = nextChar ? "NEXT KEY: " + nextChar.toUpperCase() : "";
  } else {
    romajiGuideEl.textContent = "";
  }
}

function startGame() {
  if (contestantNameInput && !contestantNameInput.value.trim()) {
    contestantNameInput.focus();
    if (leaderboardStatus) leaderboardStatus.textContent = "参加者名を入力してから開始してください。";
    return;
  }
  playSE(seStart);

  score = 0;
  time = 60;
  wordSequenceIndex = 0;

  resetPool("short");
  resetPool("medium");
  resetPool("long");

  scoreEl.textContent = "スコア: 0";
  timeEl.textContent = "残り時間: 60";
  gameOverEl.textContent = "";

  inputEl.disabled = false;
  inputEl.value = "";
  inputEl.placeholder = "";
  inputEl.focus();

  setNewWord();

  clearInterval(timer);
  timer = setInterval(() => {
    time--;
    timeEl.textContent = "残り時間: " + time;
    if (time <= 0) {
      clearInterval(timer);
      gameOver();
    }
  }, 1000);
}

function gameOver() {
  playSE(seEnd);

  // タイムアップ時点で入力完了していた「ひらがな」の文字数をボーナスとして計算
  let bonus = 0;
  for (let i = 0; i < tokenIndex; i++) {
    bonus += kanaTokens[i].length;
  }
  
  const finalScore = score + bonus;

  kanjiEl.textContent = "ゲーム終了";
  kanaEl.textContent = "";
  romajiGuideEl.textContent = "";
  inputEl.value = "";
  inputEl.placeholder = "STARTを押してタイピング開始";
  inputEl.disabled = true;

  if (bonus > 0) {
    gameOverEl.textContent = `あなたのスコア: ${finalScore} (ボーナス +${bonus}pt)`;
  } else {
    gameOverEl.textContent = `あなたのスコア: ${finalScore}`;
  }
  submitContestScore(finalScore);
}

inputEl.addEventListener("input", () => {
  if (!currentWord || inputEl.disabled) return;

  const typedVal = inputEl.value.toLowerCase();
  let testInput = typedVal.slice(typedRomajiHistory.length);

  const curToken = kanaTokens[tokenIndex];
  const nextToken = kanaTokens[tokenIndex + 1] || null;

  // 通常候補の確認（nn, n', xn, n などを判定）
  const candidates = getCandidates(curToken, nextToken);
  let matchedCandidates = candidates.filter(c => c.startsWith(testInput));

  // 「n」1回入力時の子音連携判定：標準マッチがなく、次が母音/y以外の子音なら 「n」 で自動確定
  if (matchedCandidates.length === 0 && curToken === "ん" && testInput.length > 1 && testInput.startsWith("n")) {
    const nextChar = testInput[1];
    if (nextToken) {
      const nextCandidates = getCandidates(nextToken, kanaTokens[tokenIndex + 2] || null);
      // 次の打鍵文字が、次のかなの候補の開始文字と一致しているか
      const isValidNextChar = nextCandidates.some(c => c.startsWith(nextChar));
      if (isValidNextChar && !["a", "i", "u", "e", "o", "y"].includes(nextChar)) {
        typedRomajiHistory += "n";
        testInput = testInput.slice(1);
        tokenIndex++;
        currentInput = "";

        // 次トークンに切り替えて再評価
        const newCurToken = kanaTokens[tokenIndex];
        const newNextToken = kanaTokens[tokenIndex + 1] || null;
        const newCandidates = getCandidates(newCurToken, newNextToken);
        matchedCandidates = newCandidates.filter(c => c.startsWith(testInput));
      }
    }
  }

  if (matchedCandidates.length > 0) {
    currentInput = testInput;
    const exactMatch = matchedCandidates.find(c => c === currentInput);

    if (exactMatch) {
      typedRomajiHistory += exactMatch;
      currentInput = "";
      tokenIndex++;

      if (tokenIndex >= kanaTokens.length) {
        playSE(seCorrect);
        score += currentWord.kana.length;
        scoreEl.textContent = "スコア: " + score;
        setNewWord();
        return;
      }
    }

    updateNextKeyGuide();
  } else {
    playSE(seMiss);
    const panel = document.getElementById("game");
    if (panel) {
      panel.classList.remove("shake");
      void panel.offsetWidth;
      panel.classList.add("shake");
      window.setTimeout(() => panel.classList.remove("shake"), 360);
    }
    inputEl.classList.remove("input-wrong");
    void inputEl.offsetWidth;
    inputEl.classList.add("input-wrong");
    window.setTimeout(() => inputEl.classList.remove("input-wrong"), 300);
    inputEl.value = typedRomajiHistory + currentInput;
  }
});

startBtn.addEventListener("click", startGame);