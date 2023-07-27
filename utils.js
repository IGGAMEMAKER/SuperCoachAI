// TODO duplicate in src/utils.js
const getUniqueDay = date => {
  var d = new Date(date);

  return d.getUTCFullYear() * 1000000 + d.getUTCMonth() * 1000 + d.getUTCDate()
}
const isHabitDoneOnDayX = (progress, habitId, date) => {
  var sameHabit = progress.habitId === habitId
  var d1 = getUniqueDay(date)
  var d2 = getUniqueDay(progress.date)
  var sameDay = d1 === d2

  console.log('isHabitDoneOnDayX', sameHabit, sameDay, d1, d2)
  return sameHabit && sameDay
}

module.exports = {
  getUniqueDay,
  isHabitDoneOnDayX
}
