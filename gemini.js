const GEMINI_API_KEY =
  PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");

function callGeminiAPI(prompt, userId) {
  log.log("🚀callGeminiAPI");
  const cache = new customCache(userId);
  const history = JSON.parse(cache.get("history") || "[]");
  const userPrompt = prompt;
  log.log(`user's prompt: ${userPrompt}`);
  const systemInstruction = {
    parts: [
      {
        text: systemInstructionText,
      },
    ],
  };

  const contents = [...history];

  // ユーザーの入力があれば、それをcontentsに追加する
  if (userPrompt) {
    contents.push({
      role: "user",
      parts: [
        {
          text: userPrompt,
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

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
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

  const data = JSON.parse(response);
  let functionCall = undefined;
  let text = undefined;
  try {
    functionCall = data["candidates"][0]["content"]["parts"][0]["functionCall"];
    text = data["candidates"][0]["content"]["parts"][0]["text"];
  } catch (e) {
    log.error("❌️Gemini API Error\n" + e + "\n" + JSON.stringify(data));
    return "エラーが発生しました";
  }

  log.log(`✅️接続成功\nレスポンス時間: ${responseTimeSec} 秒`);

  let modelResponse = "";
  if (functionCall) {
    log.log(`functionCall: ${functionCall}`);
    if (functionCall.name === "clearConversationHistory") {
      modelResponse = clearConversationHistory(userId, userPrompt, cache);
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
            //スタンプが送信された場合に undefined となるが、そのままだと次回APIに送信する際エラーになる
            text: userPrompt || "",
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

function clearConversationHistory(userId, userPrompt, cache) {
  log.log("🚀clearConversationHistory");
  const newHistoryJson = [
    {
      role: "user",
      parts: [
        {
          text: userPrompt,
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
  const text = "おはよ";
  const response = callGeminiAPI(text, "test");
  log.log(response);
}
