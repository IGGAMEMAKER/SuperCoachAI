const {MESSAGE_TYPE_DEFAULT} = require("./constants");
const {UserModel, MessageModel} = require("./Models");

const saveMessage = async (text, sender, chatId, messageType=MESSAGE_TYPE_DEFAULT) => {
  var message = new MessageModel({
    text,
    sender,
    chatId,
    date: new Date(),
    type: messageType
  })

  // console.log('save message', text, typeof text, sender, typeof sender, chatId, typeof chatId, date)
  console.log('save message', typeof text, text, typeof sender, sender, typeof chatId, chatId)
  // await UserModel.updateOne({telegramId: chatId}, {lastMessageTime: Date.now()})

  var s = await message.save()
  console.log(s)

  return s
}

const changeAnswerStatus = (chatId, sessionStatus) => UserModel.updateOne(
  {telegramId: chatId + ""},
  {
    sessionStatus,

    lastMessageTime: Date.now()
  })

// const changeAnswerStatus = (chatId, hasAnswer, isAIAnswer = false) => UserModel.updateOne(
//   {telegramId: chatId + ""},
//   {
//     hasAnswer,
//     isAIAnswer,
//
//     lastMessageTime: Date.now()
//   })


module.exports = {
  saveMessage,
  changeAnswerStatus,
}