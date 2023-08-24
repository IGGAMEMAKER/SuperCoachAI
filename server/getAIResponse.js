const OpenAI = require('openai')
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

var GPT_creation_time = new Date(1692877074343);

const getAIResponse = async (chatId) => {
  var messages = await MessageModel.find({chatId})
  const SENDER_GPT = "-2";
  const SENDER_ADMIN = "-1"

  messages = messages
    .filter(m => new Date(m.date).getTime() >= GPT_creation_time) // don't take into account preGPT messages
    .filter(m => m.sender === SENDER_GPT || m.sender === chatId) // user and ai

  console.log('GOT MESSAGES FROM DB', messages);

  messages = messages
    .map(m => {
      if (m.sender === SENDER_GPT) {
        return ai(m.text)
      }

      return usr(m.text)
    })

  messages.unshift({role: 'system', content: systemMessage})
  console.log('messages PATCHED WITH ROLES', JSON.stringify(messages, null, 2))

  try {
    const completion = await openai.chat.completions.create({
      messages,
      model: 'gpt-3.5-turbo',
    });

    // console.log(completion.choices);
    // console.log('CHOICES')
    // console.log(JSON.stringify(completion, null, 2))

    var answer = completion.choices[0].message.content

    console.log('answer is', answer)

    return Promise.resolve(answer)
  } catch (e) {
    console.error('Failed to get answer from ChatGPT', e, chatId)

    return Promise.resolve('Failed to get answer from ChatGPT')
  }
}


module.exports = {
  getAIResponse
}