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
  }
  log(arg) {
    console.log(arg);
    //this.logs.push(arg);
  }
}
const log = new customLogger();
