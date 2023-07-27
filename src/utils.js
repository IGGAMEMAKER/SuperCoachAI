export const getIndexByID = (list, id) => list.findIndex(item => item.id === id)
export const getByID = (list, id) => list.find(item => item.id === id)
export const getNextID = list => {
  var ids = list.map(a => a.id || 0)
  // console.log({ids})

  if (!ids.length)
    ids.push(0)

  return 1 + Math.max(...ids)
}

const swap = (i1, i2, array) => {
  if (i1 < array.length && i2 < array.length && i1 >= 0 && i2 >= 0) {
    var r1 = array[i1];
    var r2 = array[i2];

    array[i2] = r1
    array[i1] = r2
  }
  return array
}

export const patchWithIDs = (list, tagName = '', printOnly = true) => {
  var undefinedCount = 0;

  for (var i = 0; i < list.length; i++) {
    if (list[i].id === undefined) {
      undefinedCount++
      if (!printOnly)
        list[i].id = getNextID(list)
    }
  }

  if (undefinedCount > 0) {
    console.log('pushed to ', {tagName}, undefinedCount)
  }

  return undefinedCount
}

export const pusher = (list, item, tagName = '') => {
  list.push(item);
  patchWithIDs(list, tagName, false)
}

export const removeById = (list, id) => {
  list.splice(getIndexByID(list, id), 1)
}

// ---------------------
// TODO duplicate in utils.js
export const getUniqueDay = date => {
  var d = new Date(date);

  return d.getUTCFullYear() * 1000000 + d.getUTCMonth() * 1000 + d.getUTCDate()
}
export const isHabitDoneOnDayX = (progress, habitId, date) => {
  var sameHabit = progress.habitId === habitId
  var d1 = getUniqueDay(date)
  var d2 = getUniqueDay(progress.date)
  var sameDay = d1 === d2

  console.log('isHabitDoneOnDayX', sameHabit, sameDay, d1, d2)
  return sameHabit && sameDay
}