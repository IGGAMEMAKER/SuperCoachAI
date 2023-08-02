const {ADMINS_KOSTYA} = require("../src/constants/admins");
const {ADMINS_ME} = require("../src/constants/admins");
const {respondAsAdmin, launch, sendTGMessage} = require("./saveTelegramMessages");
const {saveMessage} = require("./saveMessagesInDB");
const {isHabitDoneOnDayX} = require("../utils");

var morningIsAtTimezoneX = () => {
  var utcHours = new Date().getUTCHours() // 7

  switch (utcHours) {
    case 0: return 10;
    case 1: return 11;
    case 2: return 12;

    case 3: return -11;
    case 4: return -10;
    case 5: return -9;
    case 6: return -8;
    case 7: return -7;
    case 8: return -6;
    case 9: return -5;
    case 10: return -4;
    case 11: return -3;
    case 12: return -2;
    case 13: return -1;
    case 14: return 0;
    case 15: return 1;
    case 16: return 2;
    case 17: return 3;
    case 18: return 4;
    case 19: return 5;
    case 20: return 6;
    case 21: return 7;
    case 22: return 8;
    case 23: return 9;
    default: console.log('WUUUUT', utcHours); return 1000000; break;
  }

  var diff = 10 - utcHours
  return diff
}

console.log('10AM is currently in UTC:' + morningIsAtTimezoneX())

const TIME_FROM_MORNING = "9:00"
const TIME_FROM_AFTERNOON = "12:00"
const TIME_FROM_EVENING = "16-00"

var CronJob = require('cron').CronJob;
var job = new CronJob(
  '0 0 */3 * * *',
  function() {
    console.log('You will see this message every minute');
    // var serverOffset = new Date().getTimezoneOffset() / -60; // 3

    var tenAMCurrentlyInTimezoneX = morningIsAtTimezoneX()
    console.log(tenAMCurrentlyInTimezoneX)

    // UserModel.find({timeZone: tenAMCurrentlyInTimezoneX})
    UserModel.find({})
      .then(users => {
        users.forEach(u => {
          var telegramId = u.telegramId;
          var name = u.name || u.username || u.telegramId
          var d = new Date().getDay()

          const exists = h => h.schedule[d.toString()];
          var habits = u.habits.filter(exists)

          const isMorningTask   = t => t.from === TIME_FROM_MORNING
          const isAfternoonTask = t => t.from === TIME_FROM_AFTERNOON
          const isEveningTask   = t => t.from === TIME_FROM_EVENING

          var morningTasks    = habits.filter(isMorningTask)
          var afternoonTasks  = habits.filter(isAfternoonTask)
          var eveningTasks    = habits.filter(isEveningTask)

          var mapTasks = h => h.name;

          var taskCount = morningTasks.length + afternoonTasks.length + eveningTasks.length
          var hasTasks = taskCount > 0

          var message = `Good morning, ${name} ☀️
          \nHere’s your plan for today:

          Morning: ${morningTasks.map(mapTasks).join(', ')}
          
          Afternoon: ${afternoonTasks.map(mapTasks).join(', ')}
          
          Evening: ${eveningTasks.map(mapTasks).join(', ')}
        \nReady to grind? 💪🏽
        \nHave a nice day! 🏆`

          if (hasTasks) {
            console.log('will send in TG', taskCount + '/' + u.habits.length + ' TASKS ', telegramId)

            if (telegramId === ADMINS_ME || telegramId === ADMINS_KOSTYA) {
              sendTGMessage(telegramId, message).then().catch().finally()
            }
          }
        })
      })
  },
  null,
  true,
  // 'America/Los_Angeles'
);

const {app} = require('./expressGenerator')(3333);

const {UserModel, MessageModel} = require('./Models')

const getCookies = req => {
  return {
    telegramId: req.cookies["telegramId"]
  }
}

const flushCookies = (res) => {
  setCookies(res, '', '')
}
const setCookies = (res, telegramId) => {
  res.cookie('telegramId', telegramId)
}

const renderAdminPanel = (req, res) => {
  var appPath = __dirname.replace('server', 'build') + '/admin.html'
  res.sendFile(appPath);
}

const renderSPA = (req, res) => {
  var appPath = __dirname.replace('server', 'build') + '/index.html'
  res.sendFile(appPath);
}

const getUser = async (req, res) => {
  console.log('getUser', req.body)
  var telegramId = req.body.telegramId
  var timeZone = req.body.timeZone
  console.log({telegramId, timeZone})

  UserModel.findOne({telegramId})
    .then(u => {
      var mockUser = {telegramId, timeZone, habits: []}

      console.log({u})
      // save cookies
      if (!u) {
        u = new UserModel(mockUser)

        u.save()
          .then(r => {
            console.log('user saved', r)
            setCookies(res, telegramId)
            res.json({profile: mockUser})
          })
          .catch(err => {
            console.error({err})
            flushCookies(res)
            res.json({profile: mockUser, error: 1})
          })
      } else {
        if (u.timeZone !== timeZone)
          UserModel.updateOne({telegramId}, {timeZone}).then().catch().finally()
        setCookies(res, telegramId)
        res.json({profile: u}) // progress??
      }
    })
}

const authenticate = async (req, res, next) => {
  // get telegramId here
  var c = getCookies(req)
  console.log('authenticate', c)
  var {telegramId} = c // '' // req.cookies(???) req.body?

  UserModel.find({telegramId})
    .then(u => {
      if (!u) {
        next(1)
      } else {
        req.telegramId = telegramId
        next()
      }
    })
    .catch(err => {
      next(err)
    })
}

const saveHabits = async (req, res) => {
  var habits = req.body.habits
  console.log({habits}, req.telegramId)

  var r = await UserModel.updateOne(
    {telegramId: req.telegramId},
    {habits}
  )

  console.log({r})
  // if (r.modifiedCount) // then habits saved

  res.json({r})
}

var seq = (progress) => progress.map((p, i) => ({
  date: new Date(Date.now() - i * 24 * 3600 * 1000),
  progress: p
}))

const getAllUsers = (req, res) => {
  UserModel.find()
    .then(users => {
      res.json({users})
    })
    .catch(err => {
      res.json({
        users: [],
        err
      })
    })
}

const getMessagesOfUser = async (req, res) => {
  var {telegramId} = req.params
  res.json({
    messages: await MessageModel.find({chatId: telegramId}) //['hi, zyabl']
  })
}


const saveMessagesRoute = async (req, res) => {
  var {chatId, text, sender} = req.body;

  var s = await saveMessage(text, sender, chatId, new Date())

  console.log(s, 'save message')
  res.json({
    ok: 1
  })
}

const answerToUserRoute = async (req, res) => {
  var {text, chatId} = req.body;
  await respondAsAdmin(chatId, text)

  res.json({ok: 1})
}

const saveHabitProgress = (req, res) => {
  // console.log('/habits/progress')
  var {date, habitId} = req.body
  console.log(date, habitId)
  var telegramId = req.telegramId

  UserModel.findOne({telegramId})
    .then(u => {
      var progress = u.progress || [];
      console.log(progress)

      if (progress.find(p => isHabitDoneOnDayX(p, habitId, date) )) {
        console.log("remove habit")
        progress = progress.filter(p => !isHabitDoneOnDayX(p, habitId, date))
      } else {
        console.log("add habit")
        progress.push({habitId, date})
      }

      console.log('progress', progress)

      UserModel.updateOne({telegramId}, {progress})
        .then(r => {
          console.log('saved progress??')
          res.json({ok: 1, habitProgress: progress})
        })
        .catch(err => {
          console.error('caught when updating progress', {err})
          res.json({fail: 1, cannotSaveProgress: 1, err})
        })
    })
    .catch(err => {
      console.error('caught cause failed to get user??', err)
      res.json({fail: 1, noUser: 1})
    })
}


// ROUTES
app.get('/', renderSPA)
app.get('/admin', renderSPA)
app.post('/profile', getUser)

app.all('/admin/users', getAllUsers)
app.post('/messages', saveMessagesRoute)
app.post('/answer', answerToUserRoute)
app.get('/messages/:telegramId', getMessagesOfUser)

app.put('/habits', authenticate, saveHabits)
app.post('/habits/progress', authenticate, saveHabitProgress)

// ---------------- API ------------------------

const customErrorHandler = (err, req, res, next) => {
  console.error('custom error handler', req.url, req.method)
  if (err) {
    console.log(err, {err})
  }

  next(err)
}
const standardErrorHandler = (err, req, res, next) => {
  console.error(err, req.url);

  res.status(500);
  res.json({ error: err });
}

app.use(customErrorHandler)
app.use(standardErrorHandler)

launch()