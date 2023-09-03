const {MESSAGE_TYPE_SUMMARY} = require("./constants");
const {MessageModel} = require("./Models");

const getLastSummaryMessage = async chatId => {
  var messages = await MessageModel
    .find({chatId, type: MESSAGE_TYPE_SUMMARY})
    .sort({$natural:-1}); //.limit(1);

  console.log('getLastSummaryMessage', messages.length)
  if (messages.length)
    // return Promise.resolve(messages.slice(-1)[0])
    return Promise.resolve(messages[0])

  return Promise.resolve(null)
}

module.exports = {
  getLastSummaryMessage
}