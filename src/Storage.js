import {EventEmitter} from 'events';
import Dispatcher from './Dispatcher';
import {
  HABITS_ADD
} from "./constants/actionConstants";
import {patchWithIDs, pusher} from "./utils";
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

patchWithIDs(habits)

const getInitDataSplit = data => {
  if (!data)
    return ['no data']

  return data.split("&")
}

const parseUserInfo = s => {
  var opFigure = "%7B", opSym = "{"
  var quoteFigure = "%22", quoteSym = "*"
  var equalFigure = "%3A", equalSym = "="
  var commaFigure = "%2C", commaSym = ","
  var clFigure = "%7D", clSym = "}"

  // console.log(s)
  // console.log({s})
  var spl = s.split(quoteFigure)
  console.log(spl, 'spl')
  var ind = spl.findIndex(el => el.includes("id"))
  console.log(ind, 'ind')
  var userId = spl[ind + 1]
  console.log({userId})
  var tr = userId.substring(3, userId.length - 3)
  console.log(tr)
  return tr
  var s1 = s.replaceAll(opFigure, opSym)
  var s2 = s1.replaceAll(quoteFigure, quoteSym)
  var s3 = s2.replaceAll(equalFigure, equalSym)
  var s4 = s3.replaceAll(commaFigure, commaSym)
  var s5 = s4.replaceAll(clFigure, clSym)

  return s5;
}

// var userId = ''
var webApp = window?.Telegram?.WebApp;
var initData = getInitDataSplit(webApp?.initData)
var userData = initData[1]
var userId;

try {
  console.log({userData})
  userId = parseUserInfo(userData)
  console.log(userId)
} catch (err) {
  console.error('cannot parse user data', {err})
}

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