const {UserModel} = require("./Models");
const {MessageModel} = require("./Models");
const saveMessage = async (text, sender, chatId, date=new Date()) => {
  var message = new MessageModel({
    text,
    sender,
    chatId,
    date
  })

  // console.log('save message', text, typeof text, sender, typeof sender, chatId, typeof chatId, date)
  console.log('save message', typeof text, text, typeof sender, sender, typeof chatId, chatId)
  var s = await message.save()
  console.log(s)
  return s
}

const changeAnswerStatus = (chatId, status, isAIAnswer = false) => UserModel.updateOne({telegramId: chatId + ""}, {hasAnswer: status, isAIAnswer})
module.exports = {
  saveMessage,
  changeAnswerStatus,
}