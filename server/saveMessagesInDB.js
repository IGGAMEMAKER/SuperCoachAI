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

module.exports = {
  saveMessage
}