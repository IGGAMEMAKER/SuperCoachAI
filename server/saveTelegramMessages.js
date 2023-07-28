const {changeAnswerStatus} = require("./saveMessagesInDB");
const {saveMessage} = require("./saveMessagesInDB");
const {TG_BOT_API_KEY} = require("../CD/Configs");
const { Telegraf } = require('telegraf')
const { message } = require('telegraf/filters')

const bot = new Telegraf(TG_BOT_API_KEY);

bot.command('quit', async (ctx) => {
  // Explicit usage
  await ctx.telegram.leaveChat(ctx.message.chat.id);

  // Using context shortcut
  await ctx.leaveChat();
});

bot.on(message('text'), async (ctx) => {
  // Explicit usage
  var message = ctx.message;
  var chat = message.chat
  var chatId = chat.id;

  var text = message.text
  // await ctx.telegram.sendMessage(chatId, text);

  console.log(ctx, {ctx}, {chat})
  var sender = chatId;

  console.log({sender}, message)
  var s = await saveMessage(text, sender, chatId, new Date())
  var r = await changeAnswerStatus(chatId, false)

  console.log(r, s)
});

bot.launch();
var myChatWithBotId = 136526204

const testSend = async () => {
  await bot.telegram.sendMessage(myChatWithBotId, 'poop')

  var chat = await bot.telegram.getChat(myChatWithBotId)
  console.log(chat)
}

testSend().then().catch().finally()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

const sendTGMessage = async (chatId, text) => {
  console.log('will send message')
  await bot.telegram.sendMessage(chatId, text)
}

const launch = () => {
  console.log('bot activation')
}

module.exports = {
  sendTGMessage,
  launch
}