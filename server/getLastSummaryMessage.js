const {MESSAGE_TYPE_DEFAULT} = require("./constants");
const {SENDER_GPT} = require("./constants");
const {MESSAGE_TYPE_SUMMARY} = require("./constants");
const {MessageModel} = require("./Models");

const getLastSummaryMessage = async chatId => {
  var messages = await MessageModel
    .find({chatId, type: MESSAGE_TYPE_SUMMARY})
    .sort({$natural:-1}); //.limit(1);

  console.log('getLastSummaryMessage', messages.length)
  if (messages.length) {
    // return Promise.resolve(messages.slice(-1)[0])
    var m = messages[0]
    m.totalSessions = messages.length
    return Promise.resolve(m)
  }

  return Promise.resolve(null)
}

module.exports = {
  getLastSummaryMessage
}