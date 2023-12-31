const {SESSION_STATUS_NULL, SESSION_STATUS_SESSION_SUMMARIZED} = require("./constants")

const mongoose = require("mongoose");
const { Schema } = mongoose;

var UserSchema = new Schema({
  telegramId: String,

  habits: Array,
  progress: Array, // [{habitId, date}]
  hasAnswer: {type: Boolean, default: true},
  isAIAnswer: {type: Boolean, default: false},

  sessionStatus: {type: Number, default: SESSION_STATUS_NULL},

  lastMessageTime: {type: Number, default: 0},

  name: String,
  username: String, // telegram @username
  goal: String,
  timeZone: {type: Number, default: 0},

  quiz1: mongoose.Mixed,
  quiz2: mongoose.Mixed,

  // habits?? entire profile?
  // save habit progress too?
})

var MessageSchema = new Schema({
  sender: String, // telegramId
  text: String,
  date: Date,
  chatId: String,

  type: {type: Number, default: 0}, // 0 - default, 1 - you wanna end session? 2 - summary
  error: String,

  // summary: {type: Boolean, default: false}
})

UserSchema.index({telegramId: 1}, {unique: true})

const UserModel = mongoose.model("users", UserSchema)
const MessageModel = mongoose.model("messages", MessageSchema)


async function main() {
  console.log("main");
  await mongoose.connect('mongodb://127.0.0.1:27017/supercoach');

  console.log("connected to DB");
}
main().catch(err => console.log(err));


module.exports = {
  UserModel,
  MessageModel
}