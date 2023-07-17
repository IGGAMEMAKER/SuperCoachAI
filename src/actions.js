import Dispatcher from './Dispatcher';
import {
  HABITS_ADD
} from './constants/actionConstants';

export function addHabit(text, from, to) {
  Dispatcher.dispatch({
    actionType: HABITS_ADD,
    text,
    from,
    to
  })
}



export default {
  addHabit,
}

