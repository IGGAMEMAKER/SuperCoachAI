import Dispatcher from './Dispatcher';
import {
  HABITS_ADD, HABITS_REMOVE, HABITS_SCHEDULE_TOGGLE, PROFILE_LOAD
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
  addHabit,
  removeHabit,
  loadProfile,
  toggleHabitSchedule,
}

