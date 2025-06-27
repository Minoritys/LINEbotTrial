const GEMINI_API_KEY =
  PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");
function main() {
  const systemInstruction = {
    parts: [
      {
        text: "回答は必ず日本語で行ってください",
      },
    ],
  };
  const payload = {
    system_instruction: systemInstruction,
    contents: [
      {
        parts: [{ text: "Explain how AI works in a few words" }],
      },
    ],
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
  const options = {
    method: "POST",
    contentType: "application/json",
    payload: JSON.stringify(payload),
  };

  const response = UrlFetchApp.fetch(url, options);
  const data = JSON.parse(response);
  const content = data["candidates"][0]["content"]["parts"][0]["text"];
  console.log(data);
  console.log(content);
}
