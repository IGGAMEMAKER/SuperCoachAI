import Dispatcher from './Dispatcher';
import {
  HABITS_ADD, HABITS_DATE_EDIT, HABITS_REMOVE, HABITS_SCHEDULE_TOGGLE, PROFILE_LOAD
} from './constants/actionConstants';

export function loadProfile(telegramId) {
  Dispatcher.dispatch({
    actionType: PROFILE_LOAD,
    telegramId
  })
}

export function addHabit(text, from, to) {
  Dispatcher.dispatch({
    actionType: HABITS_ADD,
    text, from, to
  })
}

export function editHabitTime(id, time, whichTime) {
  // whichTime: 'to', 'from'
  setTimeout(() => {
    Dispatcher.dispatch({
      actionType: HABITS_DATE_EDIT,
      id, time, whichTime
    })
  }, 2000)
}

export function removeHabit(id) {
  Dispatcher.dispatch({
    actionType: HABITS_REMOVE,
    id
  })
}

export function toggleHabitSchedule(id, dayOfWeek) {
  Dispatcher.dispatch({
    actionType: HABITS_SCHEDULE_TOGGLE,
    id, dayOfWeek
  })
}




export default {
  loadProfile,

  addHabit,
  removeHabit,
  editHabitTime,
  toggleHabitSchedule,
}

