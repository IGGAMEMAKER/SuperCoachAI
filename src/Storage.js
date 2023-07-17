import {EventEmitter} from 'events';
import Dispatcher from './Dispatcher';
import {
  HABITS_ADD
} from "./constants/actionConstants";
import {pusher} from "./utils";
// import {ping, post, remove, update} from "./PingBrowser";
// import {getIndexByID, getNextID} from "./utils";


const CE = 'CHANGE_EVENT';

var seq = (progress) => progress.map((p, i) => ({
  date: new Date(Date.now() - i * 24 * 3600 * 1000),
  progress: p
}))

var habits = [
  {name: 'Cold shower', progress: seq([true, false, true, false]), from: '8:45', to: '9:25'},
  {name: 'Breathing',   progress: seq([true, true, true, true]),   from: '9:35', to: '9:45'},
  // {name: 'Cold shower', progress: seq([true, false, true, false]), fromHour: 8, fromMinutes: 45, toHour: 9, toMinutes: 25},
  // {name: 'Breathing',   progress: seq([true, true, true, true]), fromHour: 9, fromMinutes: 35, toHour: 9, toMinutes: 45},
  // {name: 'Workout',     progress: seq([true, false, true, false]), fromHour: 10, fromMinutes: 0, toHour: 11, toMinutes: 35},
  // {name: 'Super long habit description for markup test, omg why',     progress: seq([true, false, true, false]), fromHour: 12, fromMinutes: 5, toHour: 15, toMinutes: 25}
]


class Storage extends EventEmitter {
  addChangeListener(c) {
    this.addListener(CE, c);
  }

  emitChange() {
    this.emit(CE);
  }

  getHabits() {
    return habits
  }
}

const store = new Storage();



Dispatcher.register((p) => {
  const saveProjectChanges = () => {
    // console.log('will update projectId', {projectId})
    // update('/api/projects/' + projectId, {project})
    //   .finally(() => {
        store.emitChange()
      // })
  }

  switch (p.actionType) {
    case HABITS_ADD:
      console.log(HABITS_ADD, {p})
      pusher(habits, {name: p.text, progress: [], from: p.from, to: p.to })

      saveProjectChanges()
      break

    default:
      console.warn(`UNEXPECTED TYPE. Got unexpected type ${p.type}`);
      break;
  }
});

export default store;