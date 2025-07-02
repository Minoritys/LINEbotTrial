const GEMINI_API_KEY =
  PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");

function callGeminiAPI(prompt, userId) {
  const cache = new customCache(userId);
  const history = JSON.parse(cache.get("history") || "[]");
  log.log("🚀callGeminiAPI");
  log.log(`user's prompt: ${prompt}`);
  const systemInstruction = {
    parts: [
      {
        text: systemInstructionText,
      },
    ],
  };

  const contents = [...history];

  // ユーザーの入力があれば、それをcontentsに追加する
  if (prompt) {
    contents.push({
      role: "user",
      parts: [
        {
          text: prompt,
        },
      ],
    });
  }

  const payload = {
    system_instruction: systemInstruction,
    contents: contents,
    // tools: [
    //   {
    //     function_declarations: functionDefinitions,
    //   },
    // ],
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  const options = {
    method: "POST",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  };

  const startTime = new Date().getTime();
  let response;
  try {
    response = UrlFetchApp.fetch(url, options);
  } catch (e) {
    log.error("❌️callGeminiAPI失敗\n" + e);
    return "エラーが発生しました";
  }
  const endTime = new Date().getTime();
  const responseTimeMs = endTime - startTime;
  const responseTimeSec = (responseTimeMs / 1000).toFixed(2);
  log.log(`✅️接続成功\nレスポンス時間: ${responseTimeSec} 秒`);

  const data = JSON.parse(response);
  const functionCall =
    data["candidates"][0]["content"]["parts"][0]["functionCall"];
  const text = data["candidates"][0]["content"]["parts"][0]["text"];

  let modelResponse = "";
  if (functionCall) {
    log.log(`functionCall: ${functionCall}`);
    if (functionCall.name === "clearConversationHistory") {
      modelResponse = clearConversationHistory(userId, prompt, cache);
      return modelResponse;
    }
  }
  if (text) {
    //文末の余分な改行を削除する
    modelResponse = text;
    modelResponse = modelResponse.replace(/\n$/, "");
    log.log(`model's response: ${modelResponse}`);
    const newHistoryJson = [
      ...(history.length > 30 ? history.slice(-30) : history),
      {
        role: "user",
        parts: [
          {
            text: prompt,
          },
        ],
      },
      {
        role: "model",
        parts: [
          {
            text: modelResponse,
          },
        ],
      },
    ];
    cache.put("history", JSON.stringify(newHistoryJson));
    return modelResponse;
  }
}

function clearConversationHistory(userId, prompt, cache) {
  log.log("🚀clearConversationHistory");
  const newHistoryJson = [
    {
      role: "user",
      parts: [
        {
          text: prompt,
        },
      ],
    },
    {
      role: "model",
      parts: [
        {
          functionCall: {
            name: "clearConversationHistory",
            args: {},
          },
        },
      ],
    },
    {
      role: "user",
      parts: [
        {
          functionResponse: {
            name: "clearConversationHistory",
            response: {
              message: "会話履歴を削除しました",
            },
          },
        },
      ],
    },
  ];
  cache.put("history", JSON.stringify(newHistoryJson));
  modelResponse = callGeminiAPI("", userId);
  modelResponse = modelResponse + "\n(function called)";
  return modelResponse;
}

function test() {
  const cache = new customCache("Ucbd62ea03fc03b6ceea69639b7fdc9de");
  const text = "おはよ";
  const response = callGeminiAPI(text, "Ucbd62ea03fc03b6ceea69639b7fdc9de");
  log.log(response);
  cache.remove("history");
}
