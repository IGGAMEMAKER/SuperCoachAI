const {TG_BOT_API_KEY} = require("./CD/Configs");
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
  var chat = ctx.message.chat
  var chatId = chat.id;
  await ctx.telegram.sendMessage(chat.id, `Hello ${ctx.state.role}`);

  // Using context shortcut
  console.log(ctx, {ctx}, {chat})
  // await ctx.reply(`Hello ${ctx.state.role}`);

  console.log({chatId}, typeof chatId)
});

bot.on('callback_query', async (ctx) => {
  // Explicit usage
  await ctx.telegram.answerCbQuery(ctx.callbackQuery.id);

  // Using context shortcut
  await ctx.answerCbQuery();
});

bot.on('inline_query', async (ctx) => {
  const result = [];
  // Explicit usage
  await ctx.telegram.answerInlineQuery(ctx.inlineQuery.id, result);

  // Using context shortcut
  await ctx.answerInlineQuery(result);
});

bot.launch();
var myChatWithBotId = 136526204

const testSend = async () => {
  await bot.telegram.sendMessage(myChatWithBotId, 'poop')

  var chat = await bot.telegram.getChat(myChatWithBotId)
  console.log(chat)
}

testSend().then().catch().finally()

// bot.sendMessage(myChatWithBotId, 'poop')
// Enable graceful stop

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
