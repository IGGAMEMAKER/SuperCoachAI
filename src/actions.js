import Dispatcher from './Dispatcher';
import {
  ADMIN_USERS,
  HABITS_ADD, HABITS_DATE_EDIT, HABITS_PROGRESS_TOGGLE, HABITS_REMOVE, HABITS_SCHEDULE_TOGGLE, PROFILE_LOAD
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

// export function editHabitTime(id, time, whichTime) {
export function editHabitTime(id, from, to) {
  // whichTime: 'to', 'from'
  // setTimeout(() => {
    Dispatcher.dispatch({
      actionType: HABITS_DATE_EDIT,
      id, from, to
    })
  // }, 2000)
}

export function toggleHabitProgress(id, date) {
  Dispatcher.dispatch({
    actionType: HABITS_PROGRESS_TOGGLE,
    id, date
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

// ------------------------
export function loadUsersInAdminPanel() {
  Dispatcher.dispatch({
    actionType: ADMIN_USERS
  })
}


export default {
  loadUsersInAdminPanel,
  //
  loadProfile,

  addHabit,
  removeHabit,
  editHabitTime,
  toggleHabitSchedule,
  toggleHabitProgress,
}

