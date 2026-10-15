const SHEET_NAME = "Scores";
function doPost(e) {
  try {
    const data = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    const name = String(data.name || "").trim().replace(/\s+/g, " ").slice(0, 24);
    const score = Math.max(0, Math.min(1000000, Number(data.score) || 0));
    const language = String(data.language || "").slice(0, 20);
    if (!name) return json_({ ok: false, error: "Name is required" });
    const sheet = getSheet_();
    sheet.appendRow([new Date(), name, score, language]);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}
function doGet(e) {
  const params = (e && e.parameter) || {};
  if (params.action !== "leaderboard") return json_({ ok: true, service: "Typing contest score sheet" });
  const sheet = getSheet_();
  const values = sheet.getDataRange().getValues();
  const scores = values.slice(1).filter(row => row[1] !== "").map(row => ({
    name: String(row[1]), score: Number(row[2]) || 0,
    language: String(row[3] || ""), createdAt: row[0] instanceof Date ? row[0].toISOString() : String(row[0] || "")
  })).sort((a,b) => b.score-a.score).slice(0,10);
  const payload = JSON.stringify({ ok: true, scores: scores });
  if (params.callback && /^[A-Za-z_$][\w$]*$/.test(params.callback)) {
    return ContentService.createTextOutput(params.callback + "(" + payload + ");").setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(payload).setMimeType(ContentService.MimeType.JSON);
}
function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) sheet.appendRow(["Timestamp", "Contestant", "Points", "Language"]);
  return sheet;
}
function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}