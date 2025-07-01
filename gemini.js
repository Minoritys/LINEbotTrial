const GEMINI_API_KEY =
  PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");

function callGeminiAPI(prompt) {
  console.log("🚀callGeminiAPI");
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
      {
        parts: [{ text: prompt }],
      },
    ],
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_API_KEY}`;
  const options = {
    method: "POST",
    contentType: "application/json",
    payload: JSON.stringify(payload),
  };

  const startTime = new Date().getTime();
  let response;
  try {
    response = UrlFetchApp.fetch(url, options);
  } catch (e) {
    console.log("❌️接続失敗\n" + e);
    return "エラーが発生しました";
  }
  const endTime = new Date().getTime();
  const responseTimeMs = endTime - startTime;
  const responseTimeSec = (responseTimeMs / 1000).toFixed(2);

  const data = JSON.parse(response);
  const content = data["candidates"][0]["content"]["parts"][0]["text"];

  console.log(`✅️接続成功\nレスポンス時間: ${responseTimeSec} 秒`);
  return content;
}

function main() {
  const result = callGeminiAPI(inputText);
  console.log(result);
}
