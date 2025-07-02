const LINE_API_KEY =
  PropertiesService.getScriptProperties().getProperty("LINE_API_KEY");

function doPost(e) {
  try {
    log.log("🚀doPost");
    const events = JSON.parse(e.postData.contents).events;

    // https://developers.line.biz/ja/reference/messaging-api/#message-event
    for (const event of events) {
      const reply_token = event.replyToken;
      const eventType = event.type;
      log.log(`eventType: ${eventType}`);
      const userId = event.source.userId;

      if (!reply_token) {
        continue;
      }

      if (eventType == "message") {
        const messageText = event.message.text;
        let replyText = callGeminiAPI(messageText, userId);
        sendReplyMessage(replyText, reply_token);
      }
      log.writeLogSheet(userId);
    }
  } catch (e) {
    log.error(e);
  }
  return;
}

function sendReplyMessage(messageText, reply_token) {
  log.log("🚀sendReplyMessage");
  const option = {
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      Authorization: "Bearer " + LINE_API_KEY,
    },
    method: "post",
    payload: JSON.stringify({
      replyToken: reply_token,
      messages: [
        {
          type: "text",
          text: messageText,
        },
      ],
    }),
    muteHttpExceptions: true,
  };
  try {
    UrlFetchApp.fetch("https://api.line.me/v2/bot/message/reply", option);
  } catch (e) {
    log.error("❌️sendReplyMessage失敗\n" + e);
  }
  log.log("✅️送信成功");
  return;
}
