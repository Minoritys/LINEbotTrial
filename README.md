# 概要

## 目的

- Gemini と会話できる LINE bot を作成する。
- 必要に応じてツールを呼び出しできるようにする
  - ただし、ツールの呼び出しは特定文字列ではなく、Gemini が判断して普通の文脈の中で行いたい

## 使用ツール

- LINE Messaging API
  - webhook に GAS の WebApp を指定する
- Google Apps Script
  - 無料かつサーバーレス
  - Google Apps (スプレッドシートほか) が使える
- Gemini API
  - 無料で使える LLM の API
- clasp
  - GAS をローカルエディタで書くためのツール

とにかく無料で試してみたかった

# 使用方法

※ Messaging API や clasp 、Gemini API の取得方法及び使用方法は他のブログなどを参考に

1. git clone
2. clasp create
3. clasp push
4. clasp open
5. スクリプトプロパティに以下を設定する

   - LINE_API_KEY
   - GEMINI_API_KEY
   - SPREADSHEET_ID

6. スプレッドシートに以下の名前でシートを作成する
   - errorLog
   - log
7. デプロイして webhook URL を取得する
8. LINE Messaging API の webhook URL を設定する
