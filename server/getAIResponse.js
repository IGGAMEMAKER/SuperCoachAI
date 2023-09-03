const OpenAI = require('openai')
const {getLastSummaryMessage} = require("./getLastSummaryMessage");
const {MESSAGE_TYPE_DEFAULT} = require("./constants");
const {SENDER_GPT} = require("./constants");
const {ADMINS_ME} = require("../src/constants/admins");
const {MessageModel} = require("./Models");
const {UserModel} = require("./Models");
const {OPENAI_API_KEY} = require("../CD/Configs");

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY, // defaults to process.env["OPENAI_API_KEY"]
});

const systemMessage = `You are a world-class coach by ICF standards and you have to continuously coach user in this conversation. You have to follow ICF core competencies.Pay special attention to:
3. Establishes and Maintains Agreements
by questions like "what result do you want at the end of coaching practice?", "how will you know that you've achieved result?", "why it's important to you?", "how do you want to start?"
4. Cultivates Trust and Safety
by supporting expression of feelings and thoughts
by expressing support and care
by inviting client to share views on what coach is saying
5. Being present
by taking into consideration and exploring the personality of the client
by taking into consideration and exploring the strategic situation of the client 
by partnering with client and supporting client's views on how the coaching process would look like
by being curious about the client
6. Active listening
by exploring choice words that the client is using (because same words can mean different things for different people)
by exploring emotions of the client during the conversation or during the whole process
by exploring changes in client's emotions, words, energy or engagement levels
by providing summaries of clients words to improve clarity and understanding
7.  Stimulates insight
by asking questions about client
by asking question to help client look beyond current thinking about the client, situation, goals
by asking clear straighforward questions one at a time and giving the client a chance to respond
by using clear easy-to-understand and concise language
8. Assist in client's growth
by exploring client's progress towards goals
by exploring client's insights
by exploring how can the behaviour change and what goals/habits/quests can the client take as a result
by inviting client to create plans, tasks and strategies to use gained insights to improve life
ask questions one at a time. Don't talk about anything not related to coaching process, clients goal, habits and practices
`

const usr = content => ({role: 'user', content})
const ai = content => ({role: 'assistant', content})

var GPT_creation_time = 1693458987095; //1692881744060
// https://currentmillis.com/

const getRecentMessagesForUser = async chatId => {
  // TODO load raw messages since lastSummary time
  // for better performance
  var lastSummary = await getLastSummaryMessage(chatId)
  var lastSummaryTime = 0;
  if (lastSummary)
    lastSummaryTime = new Date(lastSummary.date).getTime()

  var rawMessages = await MessageModel.find({chatId})

  // TODO only include messages after last summary message
  rawMessages = rawMessages
    .filter(m => {
      var time = new Date(m.date).getTime()

      // don't take into account preGPT messages
      // && don't take previous sessions into account

      return time >= GPT_creation_time && time > lastSummaryTime
    })
    .filter(m => m.sender === SENDER_GPT || m.sender === chatId) // user and ai

  console.log(`GOT [${rawMessages.length}] MESSAGES FROM DB`, rawMessages, `GOT [${rawMessages.length}] MESSAGES FROM DB`);
  console.log('-----------------------------')
  console.log('-----------------------------')

  rawMessages = rawMessages
    .map(m => {
      if (m.sender === SENDER_GPT) {
        return ai(m.text)
      }

      return usr(m.text)
    })

  return Promise.resolve(rawMessages)
}

// getRecentMessagesForUser(ADMINS_ME)
//   .then(m => {
//
//   })
//   .catch(err => {
//     console.error({err})
//   })

const getAIResponse = async (chatId, text) => {
  var rawMessages = await getRecentMessagesForUser(chatId)
  var s = {role: 'system', content: systemMessage}

  var messages = []
  messages.push(s);
  messages.push(...rawMessages)
  messages.push(usr(text))

  console.log('messages PATCHED WITH ROLES', JSON.stringify(rawMessages, null, 2))

  try {
    const completion = await openai.chat.completions.create({
      messages,
      model: 'gpt-3.5-turbo',
    });

    var answer = completion.choices[0].message.content

    console.log('answer is', answer)

    return Promise.resolve(answer)
  } catch (e) {
    console.error('Failed to get answer from ChatGPT', e, chatId)

    return Promise.resolve('Failed to get answer from ChatGPT')
  }
}

const askGPT = async (rawMessages, wrapper, request, dbg) => {
  var s = {role: 'system', content: wrapper}

  var messages = []

  if (wrapper?.length)
    messages.push(s);

  messages.push(...rawMessages)

  if (request?.length)
    messages.push(usr(request))

  try {
    const completion = await openai.chat.completions.create({
      messages,
      model: 'gpt-3.5-turbo',
    });

    var answer = completion.choices[0].message.content

    console.log('answer is', answer)

    return Promise.resolve(answer)
  } catch (e) {
    console.error('Failed to get answer from ChatGPT', e, {dbg})

    return Promise.resolve('Failed to get answer from ChatGPT')
  }
}

const getSummarizedDialog = async (chatId) => {
  var rawMessages = await getRecentMessagesForUser(chatId)

  return askGPT(rawMessages, systemMessage, `Summarize what we've talked about`)
}


module.exports = {
  getAIResponse,
  getSummarizedDialog
}