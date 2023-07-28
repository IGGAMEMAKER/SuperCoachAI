const {UserModel} = require("./Models");
const {MessageModel} = require("./Models");
const saveMessage = async (text, sender, chatId, date=new Date()) => {
  var message = new MessageModel({
    text,
    sender,
    chatId,
    date
  })
  var s = await message.save()

  return s
}
const changeAnswerStatus = (chatId, status) => UserModel.updateOne({telegramId: chatId + ""}, {hasAnswer: status})
module.exports = {
  saveMessage,
  changeAnswerStatus,
}