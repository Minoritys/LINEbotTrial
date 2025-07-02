const SPREADSHEET_ID =
  PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");

// GASのcache service をカスタムしてユーザーごとにわける
// https://note.com/luth/n/nbc1e20d82c3f
class customCache {
  constructor(userId) {
    this.cache_name = userId;
    this.cache = CacheService.getScriptCache();
  }

  put(key, value) {
    key = this.cache_name + key;
    this.cache.put(key, value, 21600);
  }

  get(key) {
    key = this.cache_name + key;
    return this.cache.get(key);
  }

  remove(key) {
    key = this.cache_name + key;
    this.cache.remove(key);
  }
}

// logをあとでスプレッドシートに書き込むようにする
class customLogger {
  constructor() {
    this.logs = [];
    this.spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    this.errorSheet = this.spreadsheet.getSheetByName("errorLog");
    this.logSheet = this.spreadsheet.getSheetByName("log");
  }
  log(arg) {
    console.log(arg);
    this.logs.push([new Date(), arg]);
  }
  error(arg) {
    console.error(arg);
    this.errorSheet.appendRow([new Date(), arg]);
  }
  writeLogSheet(userId) {
    this.logs.map((log) => {
      log.push(userId);
    });
    const lastRow = this.logSheet.getLastRow();
    const rowLength = this.logs.length;
    const columnLength = this.logs[0].length;
    this.logSheet
      .getRange(lastRow + 1, 1, rowLength, columnLength)
      .setValues(this.logs);
    this.logs = [];
  }
}
const log = new customLogger();
