const {UserModel} = require("./Models");
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

  console.log('got text', text)
  // console.log(ctx, {ctx}, {chat})
  var sender = chatId;

  // console.log({sender}, message)
  var user = await UserModel.findOne({telegramId: chatId})
  await saveMessage(text, sender, chatId, new Date())

  var isCommandMessage = false;
  const userQuery = {telegramId: chatId}

  // if there are some command/trigger messages, respond to them!
  if (text === '/start') {
    isCommandMessage = true;
    const initialText = 'Hi!\n' +
      '\n' +
      'The app allows you to track habits and the AI Coach will help you along the way. \n\n' +
      'Let\'s begin. What\'s your name?'
    await respondAsAdmin(chatId, initialText)
    await UserModel.updateOne(userQuery, {name: '', goal: ''})
  } else if (!user.name) {
    // will write his name
    isCommandMessage = true;
    await UserModel.updateOne(userQuery, {name: text})

    const nameConfirmationText = 'What do you want to achieve with this tool?'
    await respondAsAdmin(chatId, nameConfirmationText)
  } else if (!user.goal) {
    isCommandMessage = true;

    await UserModel.updateOne(userQuery, {goal: text})
    const launchAppMessage = 'Got it! Now Launch app and add new habits.\n' +
      ' 1. Input the name of the habit\n' +
      ' 2. Select time of the day when you will perform it\n' +
      ' 3. Select which days of the week will you perform it\n' +
      'After you\'re done, you can already start tracking your execution and then I will send you some tasks.\n\n' +
      'Also, if you want AI assistance, ask questions in this chat'
    await respondAsAdmin(chatId, launchAppMessage)
  }


  if (!isCommandMessage) {
    // notify admin
    var me = '136526204'
    var kostya = '137720008'

    await changeAnswerStatus(chatId, false)
    await sendTGMessage(kostya, 'You got new message from users! Reply: supercoach.site/admin')
  }
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

const respondAsAdmin = async (chatId, text) => {
  var sender = '-1'

  await saveMessage(text, sender, chatId, new Date())
  await changeAnswerStatus(chatId, true)
  await sendTGMessage(chatId, text)
}

const launch = () => {
  console.log('bot activation')
}

module.exports = {
  sendTGMessage,
  respondAsAdmin,
  launch
}