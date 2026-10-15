# Google Sheets score leaderboard setup

The typing game can save contestant names, scores, language, and timestamps to a Google Sheet. The frontend is ready, but the shared sheet stays disconnected until you deploy the Apps Script endpoint and add its URL to `sheet-config.js`.

## 1. Create the score sheet
1. Create a Google Sheet for the contest.
2. In the sheet, open **Extensions → Apps Script**.
3. Replace the starter code with the contents of [Code.gs](Code.gs), then save.

The script creates a `Scores` tab with columns: Timestamp, Contestant, Points, Language.

## 2. Deploy the endpoint
1. In Apps Script choose **Deploy → New deployment**.
2. Select **Web app** as the deployment type.
3. Set **Execute as** to **Me**.
4. Set access to **Anyone** if your organization allows it. This lets contestants submit scores without signing in. Only use this for a public contest sheet endpoint.
5. Click **Deploy**, complete Google's authorization prompt, and copy the Web app URL ending in `/exec`.

## 3. Connect the game
1. Open `sheet-config.js` in this GitHub repository.
2. Set `window.SCORE_SHEET_WEB_APP_URL` to the copied URL, keeping the quotation marks.
3. Commit the change and wait for GitHub Pages to deploy.

Both the Japanese and English game use the same URL and sheet. Contestants enter a name before starting; their final score is submitted when the round ends. The shared top-10 leaderboard refreshes from the sheet. If the URL is blank, scores only appear on that browser/device.

**Privacy note:** Tell contestants that their name and score will be recorded in the sheet. Avoid asking for sensitive personal information; a nickname is enough.
