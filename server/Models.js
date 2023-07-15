const mongoose = require("mongoose");
const { Schema } = mongoose;

async function main() {
  console.log("main");
  await mongoose.connect('mongodb://localhost:27017/supercoach');

  console.log("connected to DB");
}
main().catch(err => console.log(err));

module.exports = {}