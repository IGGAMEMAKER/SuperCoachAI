const OpenAI = require('openai')
const {OPENAI_API_KEY} = require("../CD/Configs");

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY, // defaults to process.env["OPENAI_API_KEY"]
});

async function main() {
  const completion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: 'Say this is a test' }],
    model: 'gpt-3.5-turbo',
  });

  console.log(completion.choices);
}

main()
.then(r => {
  console.log({r})
})
.catch(err => {
  console.error('failed to GPT', err)
})