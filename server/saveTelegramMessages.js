import {
  MESSAGE_TYPE_MISTAKEN_SUMMARY,
  SESSION_STATUS_ADMIN_RESPONDED,
  SESSION_STATUS_AI_RESPONDED,
  SESSION_STATUS_SESSION_SUMMARIZED,
  SESSION_STATUS_USER_RESPONDED, SESSION_STATUS_WANNA_CLOSE_SESSION
} from "./constants";
import {MessageModel} from "./Models";

const {sendTGMessage} = require("./sendTGMessage");
const {getTGBot} = require("./getTGBot")

const {SENDER_ADMIN, SENDER_GPT} = require("./constants")
const {MESSAGE_TYPE_SUMMARY} = require("./constants");

const {getAIResponse} = require("./getAIResponse");
const {ADMINS_ME, ADMINS_KOSTYA} = require("../src/constants/admins");
const {UserModel} = require("./Models");
const {changeAnswerStatus, saveMessage} = require("./saveMessagesInDB");

// const {TG_BOT_API_KEY} = require("../CD/Configs");
// const { Telegraf } = require('telegraf')
// const { message } = require('telegraf/filters')

const bot = getTGBot(); // new Telegraf(TG_BOT_API_KEY);

bot.command('quit', async (ctx) => {
  // Explicit usage
  await ctx.telegram.leaveChat(ctx.message.chat.id);

  // Using context shortcut
  await ctx.leaveChat();
});

const getLastSummaryMessage = async chatId => {
  var messages = await MessageModel.find({chatId, type: MESSAGE_TYPE_SUMMARY}).sort({$natural:-1}); //.limit(1);

  console.log('getLastSummaryMessage', {messages})
  // if (messages.length)
  return messages.find.slice(-1)
}

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
  await saveMessage(text, sender, chatId)
  await changeAnswerStatus(chatId, SESSION_STATUS_USER_RESPONDED)

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
  } else if (user.sessionStatus === SESSION_STATUS_SESSION_SUMMARIZED && text.toUpperCase() === "CONTINUE") {
    // if session was mistakenly closed, you can resume it by typing CONTINUE

    // resume session
    // remove summary, change status to
    // / Just change summary message status to MISTAKENLY_SUMMARIZED,
    // so it won't count in getRecentMessages() function

    var last = getLastSummaryMessage(chatId)
    console.log('last')
    await MessageModel.findByIdAndUpdate(last._id, {type: MESSAGE_TYPE_MISTAKEN_SUMMARY})

  } else {
    console.log('got message and needs AI response', text)

    var aiResponse = await getAIResponse(chatId, text)

    console.log('AI response will be: ', aiResponse)
    await respondAsChatGPT(chatId, aiResponse)
  }

  // TODO why not merge with previous ELSE block???
  if (!isCommandMessage) {
    // notify admin

    // await changeAnswerStatus(chatId, false)
    await sendTGMessage(ADMINS_KOSTYA, 'You got new message from users! Reply: supercoach.site/admin')
  }
});

bot.launch();
var myChatWithBotId = ADMINS_ME

const testSend = async () => {
  // await bot.telegram.sendMessage(myChatWithBotId, 'poop')
  await sendTGMessage(myChatWithBotId, 'poop2')

  var chat = await bot.telegram.getChat(myChatWithBotId)
  console.log({chat})
}

testSend().then().catch().finally()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

// const sendTGMessage = async (chatId, text) => {
//   console.log('will send message')
//
//   await bot.telegram.sendMessage(chatId, text)
// }

// const wannaCloseSession = async (telegramId) => {
//   const wannaCloseMessage = `Do you want to close session? Type anything in 10 minutes to resume`
//   await saveMessage(wannaCloseSession, SENDER_GPT, telegramId, MESSAGE_TYPE_SUMMARY)
//   await changeAnswerStatus(telegramId, SESSION_STATUS_WANNA_CLOSE_SESSION);
//   await sendTGMessage(telegramId, wannaCloseMessage);
// }


// if user sessionStatus SESSION_STATUS_AI_RESPONDED and time since lastMessageTime > 3 hours

const endSession = async (telegramId, summary) => {
  await saveMessage(summary, SENDER_GPT, telegramId, MESSAGE_TYPE_SUMMARY)
  await changeAnswerStatus(telegramId, SESSION_STATUS_SESSION_SUMMARIZED);
  await sendTGMessage(telegramId,
    `You didn't answer in last 3 hours, so session is closed.\n\n${summary}

If you still want to continue that discussion, type CONTINUE, otherwise, you can type your new question`);
}

const respondAsAdmin = async (chatId, text) => {
  var sender = SENDER_ADMIN

  await saveMessage(text, sender, chatId)
  await changeAnswerStatus(chatId, SESSION_STATUS_ADMIN_RESPONDED)
  await sendTGMessage(chatId, text)
}

const respondAsChatGPT = async (chatId, text) => {
  var sender = SENDER_GPT; // '-2'

  await saveMessage(text, sender, chatId)
  await changeAnswerStatus(chatId, SESSION_STATUS_AI_RESPONDED)
  await sendTGMessage(chatId, text)
}

const launch = () => {
  console.log('bot activation')
}

module.exports = {
  sendTGMessage,
  respondAsAdmin,
  respondAsChatGPT,
  endSession,

  launch
}