const systemInstructionText = `- 必ず日本語で回答してください\n- 回答にマークダウン記法を使用しないでください`;
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
