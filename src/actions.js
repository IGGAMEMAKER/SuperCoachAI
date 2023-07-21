import Dispatcher from './Dispatcher';
import {
  HABITS_ADD, PROFILE_LOAD
} from './constants/actionConstants';

export function addHabit(text, from, to) {
  Dispatcher.dispatch({
    actionType: HABITS_ADD,
    text,
    from,
    to
  })
}

export function loadProfile(telegramId) {
  Dispatcher.dispatch({
    actionType: PROFILE_LOAD,
    telegramId
  })
}



export default {
  addHabit,
  loadProfile
}

