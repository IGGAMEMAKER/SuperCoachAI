const {getTGBot} = require("./getTGBot");

const bot = getTGBot()

const sendTGMessage = async (chatId, text) => {
  console.log('will send message')

  await bot.telegram.sendMessage(chatId, text)
}

module.exports = {
  sendTGMessage
}