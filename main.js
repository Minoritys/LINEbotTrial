const GEMINI_API_KEY =
  PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");

function main() {
  const systemInstruction = {
    parts: [
      {
        text: systemRule,
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
  const response = UrlFetchApp.fetch(url, options);
  const endTime = new Date().getTime();
  const responseTimeMs = endTime - startTime;
  const responseTimeSec = (responseTimeMs / 1000).toFixed(2);
  
  const data = JSON.parse(response);
  const content = data["candidates"][0]["content"]["parts"][0]["text"];
  
  console.log(`レスポンス時間: ${responseTimeSec} 秒`);
  console.log(data);
  console.log(content);
}
