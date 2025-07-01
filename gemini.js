const GEMINI_API_KEY =
  PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");

function callGeminiAPI(prompt, userId) {
  const cache = new customCache(userId);
  const history = JSON.parse(cache.get("history") || "[]");
  log.log("🚀callGeminiAPI");
  const systemInstruction = {
    parts: [
      {
        text: systemInstructionText,
      },
    ],
  };

  const payload = {
    system_instruction: systemInstruction,
    contents: [
      ...history,
      {
        role: "user",
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ],
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_API_KEY}`;
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
    log.log("❌️接続失敗\n" + e);
    return "エラーが発生しました";
  }
  const endTime = new Date().getTime();
  const responseTimeMs = endTime - startTime;
  const responseTimeSec = (responseTimeMs / 1000).toFixed(2);

  const data = JSON.parse(response);
  let modelResponse = data["candidates"][0]["content"]["parts"][0]["text"];
  //文末の余分な改行を削除する
  modelResponse = modelResponse.replace(/\n$/, "");

  log.log(`✅️接続成功\nレスポンス時間: ${responseTimeSec} 秒`);
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
