const mongoose = require("mongoose");
const { Schema } = mongoose;

var UserSchema = new Schema({
  telegramId: String,

  habits: Array,
  progress: Array,
  // habits?? entire profile?
  // save habit progress too?
})

UserSchema.index({telegramId: 1}, {unique: true})

const UserModel = mongoose.model("users", UserSchema)

async function main() {
  console.log("main");
  await mongoose.connect('mongodb://localhost:27017/supercoach');

  console.log("connected to DB");
}
main().catch(err => console.log(err));

module.exports = {
  UserModel
}