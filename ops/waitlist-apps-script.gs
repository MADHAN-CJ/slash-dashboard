/**
 * /markets waitlist — Google Apps Script backend.
 *
 * Setup (once):
 *   1. Open the Google Sheet → Extensions → Apps Script. Replace the editor contents with this file.
 *   2. Deploy → New deployment → type "Web app" → Execute as: Me → Who has access: Anyone → Deploy.
 *   3. Copy the Web app URL (ends in /exec) into the form's data-endpoint in index.html
 *      (Astro: PUBLIC_WAITLIST_ENDPOINT env var).
 *   After editing this script: Deploy → Manage deployments → ✎ → Version: New → Deploy (URL stays the same).
 *
 * Columns: timestamp | email | source | page | referrer | user_agent
 */

var SHEET_NAME = "Waitlist";

function doPost(e) {
  try {
    var data = JSON.parse((e && e.postData && e.postData.contents) || "{}");

    // Honeypot: bots fill the hidden "company" field. Pretend success, store nothing.
    if (data.hp) return json_({ ok: true });

    var email = String(data.email || "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return json_({ ok: false, error: "invalid_email" });

    var lock = LockService.getScriptLock();
    lock.waitLock(5000);
    try {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
      if (sh.getLastRow() === 0) {
        sh.appendRow(["timestamp", "email", "source", "page", "referrer", "user_agent"]);
        sh.setFrozenRows(1);
      }
      var last = sh.getLastRow();
      if (last > 1) {
        var existing = sh.getRange(2, 2, last - 1, 1).getValues();
        for (var i = 0; i < existing.length; i++) {
          if (String(existing[i][0]).toLowerCase() === email) return json_({ ok: true, duplicate: true });
        }
      }
      sh.appendRow([
        new Date(),
        email,
        clip_(data.source, 40),
        clip_(data.page, 500),
        clip_(data.referrer, 500),
        clip_(data.ua, 300),
      ]);
    } finally {
      lock.releaseLock();
    }
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: "server_error" });
  }
}

// Visiting the URL in a browser shows this instead of an error.
function doGet() {
  return json_({ ok: true, service: "slash.markets waitlist" });
}

function clip_(v, n) {
  v = v == null ? "" : String(v);
  return v.length > n ? v.slice(0, n) : v;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
