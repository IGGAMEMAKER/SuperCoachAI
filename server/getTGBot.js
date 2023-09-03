const {TG_BOT_API_KEY} = require("../CD/Configs");
const { Telegraf } = require('telegraf')
const { message } = require('telegraf/filters')

const bot = new Telegraf(TG_BOT_API_KEY);
const getTGBot = () => {
  return new Telegraf(TG_BOT_API_KEY)
}

module.exports = {
  getTGBot
}
