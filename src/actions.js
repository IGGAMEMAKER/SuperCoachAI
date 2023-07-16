import Dispatcher from './Dispatcher';
import {
  HABITS_ADD
} from './constants/actionConstants';

export function addHabit(text) {
  Dispatcher.dispatch({
    actionType: HABITS_ADD,
    text
  })
}



export default {
  addHabit,
}

