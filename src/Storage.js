import {EventEmitter} from 'events';
import Dispatcher from './Dispatcher';
import {
  HABITS_ADD, PROFILE_LOAD
} from "./constants/actionConstants";
import {patchWithIDs, pusher} from "./utils";
import {post} from "./PingBrowser";
// import {ping, post, remove, update} from "./PingBrowser";
// import {getIndexByID, getNextID} from "./utils";


const CE = 'CHANGE_EVENT';



var habits = [
  // {name: 'Cold shower', progress: seq([true, false, true, false]), from: '8:45', to: '9:25', schedule: [0, 1, 2, 3, 4, 5, 6]},
  // {name: 'Breathing',   progress: seq([true, true, true, true]),   from: '9:35', to: '9:45', schedule: [0, 1, 2, 3, 4]},
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

const getTelegramId = () => {
  var webApp = window?.Telegram?.WebApp;
  var initData = getInitDataSplit(webApp?.initData)
  var userData = initData[1]

  try {
    console.log({userData})
    var id = parseUserInfo(userData)

    console.log(id)

    return id
  } catch (err) {
    console.error('cannot parse user data', {err})

    return 'myTGId'
  }
}

var telegramId = getTelegramId()


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
    case PROFILE_LOAD:
      post('/profile', {telegramId})
        .then(r => {
          console.log('load profile', r, telegramId)
        })
        .catch(err => {
          console.error('caught on /profile', err)
        })
      break;

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