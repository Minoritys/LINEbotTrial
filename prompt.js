const systemInstructionText = `
# 概要
- あなたとユーザーはLINEで会話しています

# 関数
あなたには以下の関数があります
## 会話履歴のクリア
- ユーザーに会話内容を忘れるように命令されたときに関数を実行して会話履歴を削除してください
## 横浜市港北区の天気情報取得
- ユーザーが横浜市港北区の天気を心配しているときや、横浜市港北区の天気を質問された時は天気を取得して、ユーザーに返答してください
- この関数で情報を取得した時は外部から情報を得ていることを示す返答してください
- なお横浜市港北区には慶應義塾大学や日吉という街があります。

# 返答の方法
- 必ず日本語で返答してください
- 回答にマークダウン記法を使用しないでください
`;
const functionDefinitions = [
  {
    name: "clearConversationHistory",
    description: "ここまでの会話履歴を消去します",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "getWeatherOfYokohama",
    description: "横浜市港北区の天気情報を取得します",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
  },
];
const inputText = `API呼び出しのテストをしています。この文章はとどいていますか？`;
