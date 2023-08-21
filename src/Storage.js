import {EventEmitter} from 'events';
import Dispatcher from './Dispatcher';
import {
  ADMIN_USERS,
  HABITS_ADD,
  HABITS_DATE_EDIT,
  HABITS_PROGRESS_TOGGLE,
  HABITS_REMOVE,
  HABITS_NAME_EDIT,
  HABITS_SCHEDULE_TOGGLE,
  PROFILE_LOAD
} from "./constants/actionConstants";
import {getIndexByID, patchWithIDs, pusher, removeById} from "./utils";
import {ping, post, update, remove} from "./PingBrowser";
import actions from "./actions";


const CE = 'CHANGE_EVENT';



var habits = [
  // {name: 'Cold shower', progress: seq([true, false, true, false]), from: '8:45', to: '9:25', schedule: [0, 1, 2, 3, 4, 5, 6]},
  // {name: 'Breathing',   progress: seq([true, true, true, true]),   from: '9:35', to: '9:45', schedule: [0, 1, 2, 3, 4]},
]
var habitProgress = []
var users = []
var passedQuiz1 = false
var passedQuiz2 = false
var loadedProfile = false

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

const getColorScheme = () => {
  var webApp = window?.Telegram?.WebApp;

  colorScheme = webApp?.colorScheme ; // || "light"
  console.log({colorScheme})

  return colorScheme;
}

const getTelegramId = () => {
  var webApp = window?.Telegram?.WebApp;
  var initData = getInitDataSplit(webApp?.initData)
  var userData = initData[1]

  colorScheme = webApp?.colorScheme ; // || "light"
  console.log({colorScheme})

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

var colorScheme;
var telegramId = getTelegramId()

var initializeTGApp = () => {
  try {
    var webApp = window?.Telegram?.WebApp;

    var {MainButton, BackButton} = webApp

    console.log('MAIN BUTTON', {MainButton})

    // BackButton.show()

    setInterval(() => {
      // MainButton.hide()
      window?.Telegram?.WebApp.MainButton.setText('MAAAAIN')
    }, 1000)
  } catch (e) {
    console.error('cannot initializeTGApp', e)
  }
}

// initializeTGApp()

class Storage extends EventEmitter {
  addChangeListener(c) {
    this.addListener(CE, c);
  }

  emitChange() {
    this.emit(CE);
  }

  getTelegramId() {
    return telegramId
  }

  getHabits() {
    return habits
  }

  getHabitProgress() {
    return habitProgress
  }

  getUsers() {
    return users
  }

  isProfileLoaded() {
    return loadedProfile
  }

  isPassedQuiz1() {
    return passedQuiz1
  }

  isPassedQuiz2() {
    return passedQuiz2
  }

  getTheme() {
    return getColorScheme()
  }
}

const store = new Storage();
const navigate = url => {
  // var newUrl = domain + url
  // var newUrl = window.location.origin + url
  // if (newUrl.startsWith('/'))
  //   newUrl = newUrl.substring(1)

  // console.log(newUrl)
  // window.location.href = newUrl
  window.location.pathname = url
}

Dispatcher.register(async (p) => {
  const saveProfileChanges = () => {
    console.log('will update profile')
    return update('/habits', {habits})
      .finally(() => {
        store.emitChange()
      })
  }

  const loadProfile = (telegramId, timeZone) => {
    post('/profile', {telegramId, timeZone})
      .then(r => {
        console.log('load profile', r, telegramId)

        habits        = r.profile.habits
        habitProgress = r.profile.progress
        passedQuiz1   = !!r.profile.quiz1
        passedQuiz2   = !!r.profile.quiz2
        loadedProfile = true

        if (!passedQuiz1) {
          navigate('/quiz/1')
        }
      })
      .catch(err => {
        console.error('caught on /profile', err)
      })
      .finally(() => {
        store.emitChange()
      })
  }

  switch (p.actionType) {
    case ADMIN_USERS:
      post('/admin/users')
        .then(r => {
          console.log('users', r)
          users = r.users;
        })
        .catch(err => {
          console.error('err', err)
        })
        .finally(() => {
          store.emitChange()
        })
      break;

    case PROFILE_LOAD:
      console.log(PROFILE_LOAD, p)

      loadProfile(getTelegramId(), p.timeZone)
      break;

    case HABITS_SCHEDULE_TOGGLE:
      var ind = getIndexByID(habits, p.id)
      habits[ind].schedule[p.dayOfWeek] = !habits[ind].schedule[p.dayOfWeek]

      await saveProfileChanges()
      break;
    case HABITS_DATE_EDIT:
      var ind = getIndexByID(habits, p.id)
      // habits[ind][p.whichTime] = p.time
      habits[ind].from = p.from
      habits[ind].to = p.to

      await saveProfileChanges()
      break;

    case HABITS_REMOVE:
      removeById(habits, p.id)

      await saveProfileChanges()
      remove('/habits/' + p.id, {})
        .then(r => {
          console.log({r})
        })
        .catch(err => {
          console.error('remove habit', err)
        })
        .finally(() => {
          actions.loadProfile()
        })

      break;

    case HABITS_NAME_EDIT:
      var ind = getIndexByID(habits, p.id)
      habits[ind].name = p.name

      await saveProfileChanges()
      break;

    case HABITS_ADD:
      console.log(HABITS_ADD, {p})
      pusher(habits, {
        name: p.text,
        schedule: p.schedule, // 1 - yes, 0 - no
        from: p.from,
        to: p.to
      })

      await saveProfileChanges()
      break

    case HABITS_PROGRESS_TOGGLE:
      console.log(HABITS_PROGRESS_TOGGLE)
      post('/habits/progress', {date: p.date, habitId: p.id})
        .then(r => {
          console.log('save progress', r)
          habitProgress = r.habitProgress;
          // store.emitChange()
        })
        .catch(err => {
          console.error('caught while progress save', err, p)
        })
        .finally(() => {
          store.emitChange()
        })
      break;

    default:
      console.warn(`UNEXPECTED TYPE. Got unexpected type ${p.type}`);
      break;
  }
});



export default store;