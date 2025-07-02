const GEMINI_API_KEY =
  PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");

function callGeminiAPI(prompt, userId, useStable = false) {
  log.log("🚀callGeminiAPI");
  if (useStable) log.log("on Stable model");
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

  const contents = [
    ...history,
    userPrompt
      ? {
          role: "user",
          parts: [
            {
              text: userPrompt,
            },
          ],
        }
      : undefined,
  ];

  const payload = {
    system_instruction: systemInstruction,
    contents: contents,
    tools: [
      {
        function_declarations: functionDefinitions,
      },
    ],
    generationConfig: {
      thinkingConfig: {
        thinkingBudget: -1,
        // Thinking off:
        // thinkingBudget: 0
        // Turn on dynamic thinking:
        // "thinkingBudget": -1
      },
    },
  };
  let url = "";
  if (!useStable) {
    url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite-preview-06-17:generateContent?key=${GEMINI_API_KEY}`;
  } else {
    url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${GEMINI_API_KEY}`;
  }
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
    if (!useStable) {
      log.log("stable model で再試行します");
      return callGeminiAPI(userPrompt, userId, true);
    }
    return "エラーが発生しました";
  }

  log.log(`✅️接続成功\nレスポンス時間: ${responseTimeSec} 秒`);

  let modelResponse = "";
  if (functionCall) {
    log.log(`functionCall: ${JSON.stringify(functionCall)}`);
    if (functionCall.name === "clearConversationHistory") {
      modelResponse = clearConversationHistory(userId, userPrompt, cache);
      return modelResponse + "\n(function called)";
    }
    if (functionCall.name === "getWeatherOfYokohama") {
      modelResponse = getWeatherOfYokohama(userId, userPrompt, cache, history);
      return modelResponse + "\n(function called)";
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
            text: userPrompt,
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
  return callGeminiAPI("", userId);
}

function getWeatherOfYokohama(userId, userPrompt, cache, history) {
  log.log("🚀getWeatherOfYokohama");
  const url = "https://weathernews.jp/onebox/35.523920/139.625873/";
  let html = "";
  let weatherInfo = "";
  try {
    html = UrlFetchApp.fetch(url).getContentText();
  } catch (e) {
    log.error("❌️WetherNewsのfetchに失敗\n" + e);
    weatherInfo = "天気情報を取得できませんでした";
  }
  log.log("✅️WetherNewsのfetchに成功");
  const dom = HtmlParser.parse(html);
  try {
    weatherInfo = dom.querySelectorAll(".modal__inner-text")[1].rawText;
    log.log(`抽出した天気情報: ${weatherInfo}`);
  } catch (e) {
    log.error("❌️情報抽出に失敗\n" + e);
    weatherInfo = "天気情報を取得できませんでした";
  }

  const newHistoryJson = [
    ...(history.length > 30 ? history.slice(-30) : history),
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
            name: "getWeatherOfYokohama",
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
            name: "getWeatherOfYokohama",
            response: {
              fetchTime: Utilities.formatDate(
                new Date(),
                "JST",
                "yyyy/MM/dd HH:mm"
              ),
              weatherInfomation: weatherInfo,
            },
          },
        },
      ],
    },
  ];
  cache.put("history", JSON.stringify(newHistoryJson));
  return callGeminiAPI("", userId);
}

function test() {
  const text = "ここまでの会話をわすれて";
  const response = callGeminiAPI(text, "test");
  log.log(response);
}
