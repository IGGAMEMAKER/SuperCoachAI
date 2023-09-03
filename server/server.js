const {SESSION_STATUS_AI_RESPONDED} = require("./constants");
const {MESSAGE_TYPE_MISTAKEN_SUMMARY} = require("./constants");
const {endSession} = require("./saveTelegramMessages");
const {MESSAGE_TYPE_SUMMARY} = require("./constants");
const {getSummarizedDialog} = require("./getAIResponse");
const {ADMINS_KOSTYA} = require("../src/constants/admins");
const {ADMINS_ME} = require("../src/constants/admins");
const {respondAsAdmin, launch, sendTGMessage} = require("./saveTelegramMessages");
const {saveMessage} = require("./saveMessagesInDB");
const {isHabitDoneOnDayX} = require("../utils");

const {app} = require('./expressGenerator')(3333);

const {UserModel, MessageModel} = require('./Models')

var morningIsAtTimezoneX = () => {
  var utcHours = new Date().getUTCHours()
  console.log({utcHours})

  var hrs = {
    '0': 10,
    '1': 9,
    '2': 8,

    '3': 7,
    '4': 6,
    '5': 5,
    '6': 4,
    '7': 3,
    '8': 2,
    '9': 1,
    '10': 0,
    '11': -1,
    '12': -2,
    '13': -3,
    '14': -4,
    '15': -5,
    '16': -6,
    '17': -7,
    '18': -8,
    '19': -9,
    '20': -10,
    '21': -11,
    '22': -12,
    '23': 11,
  }

  return hrs[utcHours];
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
const TIME_FROM_EVENING = "16:00"

var getHour = h => {
  var sp = h.split(':')

  return parseInt(sp[0]) * 10000 + parseInt(sp[1])
}
const fixDates = () => {
  UserModel
    .find({})
    .then(users => {
      users.forEach(u => {
        var username = u.name || u.username || u.telegramId
        var changed = false
        u.habits.forEach((h, i) => {
          if (h.from === "16-00") {
            console.log('time is fucked for ', u.telegramId, h.name)
            u.habits[i].from = TIME_FROM_EVENING
            changed = true
          }

          var defective = h.from !== TIME_FROM_MORNING && h.from !== TIME_FROM_AFTERNOON && h.from !== TIME_FROM_EVENING
          var hour = getHour(h.from)
          if (defective) {
            if (hour < 12) {
              console.log('too early, but not morning still', h.from, username)
              changed = true
              u.habits[i].from = TIME_FROM_MORNING
            }

            if (hour > 16 || hour === 0) {
              console.log('too late, but not evening still', h.from, username)
              u.habits[i].from = TIME_FROM_EVENING
              changed = true
            }

          }
        })

        // if (changed) {
        //   UserModel.updateOne({telegramId: u.telegramId}, {habits: u.habits}).then(r => {
        //     console.log('made fixes for user', username)
        //     // console.log({u, r})
        //   }).catch().finally()
        // }
      })
    })
}

fixDates()

var CronJob = require('cron').CronJob;
var job = new CronJob(
  '0 0 * * * *',
  function() {
    console.log('You will see this message every minute');
    // var serverOffset = new Date().getTimezoneOffset() / -60; // 3

    var tenAMCurrentlyInTimezoneX = morningIsAtTimezoneX()
    console.log({tenAMCurrentlyInTimezoneX})

    const finishTime = 5 // 5 minutes
    UserModel.find({
      sessionStatus: SESSION_STATUS_AI_RESPONDED,
      lastMessageTime: {$lt: Date.now() - finishTime * 60 * 1000}
    })
      .then(users => {
        users.forEach(async u => {
          var telegramId = u.telegramId

          if (telegramId === ADMINS_ME) {
            console.log('WILL TRY TO FINISH SESSION AUTOMATICALLY')

            getSummarizedDialog(telegramId)
              .then(summary => {
                endSession(telegramId, summary)
                  .then(f => {
                    console.log('maybe finish session?', f)
                  })
                  .catch(err => {
                    console.error('cannot endSession for ', telegramId, err)
                  })
              })
              .catch(err => {
                console.error('cannot summarize dialog', telegramId, err)
              })
          }
        })
      })

    UserModel.find({timeZone: tenAMCurrentlyInTimezoneX})
    // UserModel.find({})
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

          var message = `Good morning, ${name} ☀️\nHere’s your plan for today:

          \nMorning: ${morningTasks.map(mapTasks).join(', ')}
          \nAfternoon: ${afternoonTasks.map(mapTasks).join(', ')}
          \nEvening: ${eveningTasks.map(mapTasks).join(', ')}
        \n\nReady to grind? 💪🏽
        \nHave a nice day! 🏆`

          if (hasTasks) {
            console.log('will send in TG', taskCount + '/' + u.habits.length + ' TASKS ', telegramId)

            // if (telegramId === ADMINS_ME || telegramId === ADMINS_KOSTYA) {
            // if (telegramId === ADMINS_ME) {
              sendTGMessage(telegramId, message).then().catch().finally()
            // }
          }
        })
      })
  },
  null,
  true,
  // 'America/Los_Angeles'
);

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

const isMe = async (req, res, next) => {
  if (!req.me) {
    console.log('not me, so operation will not be done')
    next('not me')
  } else {
    next()
  }
}

const isTesting = async (req, res, next) => {
  if (!req.isTesting) {
    console.log('not TESTING, so operation will not be done')
    next('not TESTING')
  } else {
    next()
  }
}

const authenticate = async (req, res, next) => {
  // get telegramId here
  var c = getCookies(req)
  console.log('authenticate', c)
  var {telegramId} = c // '' // req.cookies(???) req.body?
  if (telegramId === ADMINS_ME)
    req.me = true

  if (req.me || telegramId === 'myTGId')
    req.isTesting = true

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



const resetQuizzes = async (req, res) => {
  var telegramId = req.params.telegramId;

  var r = await UserModel.updateOne({telegramId}, {$unset: {quiz1: '', quiz2: ''} })

  res.json({r})
}
const saveQuiz = num => async (req, res) => {
  var telegramId = req.telegramId
  var quiz = req.body.quiz;

  res.json({ok: 1, num, quiz})

  var upd = {}
  upd['quiz' + num] = quiz


  // upd = {
  //   quiz1: {
  //     '1': [], // if it's just a number, it means, that answer was chosen
  //     '2': [],
  //     '3': [], // multiple answers
  //
  //     // '4': 'input text'
  //   },
  // }
  console.log('will try saving', upd)

  UserModel.updateOne({telegramId}, upd)
    .then(r => {
      console.log('saved quiz', num, quiz, r)
    })
    .catch(err => {
      console.error('saving quiz failed', err, req.path)
    })
}

const getUser = async (req, res) => {
  var telegramId = req.body.telegramId
  var timeZone = req.body.timeZone
  console.log({telegramId, timeZone})

  UserModel.findOne({telegramId})
    .then(u => {
      var mockUser = {telegramId, timeZone, habits: []}

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

const getCurrentUser = req => UserModel.findOne({telegramId: req.telegramId})

const removeHabitRoute = async (req, res) => {
  console.log('removeHabitRoute')
  res.json({ok: 1})

  var query = {telegramId: req.telegramId}
  var habitId = req.params.habitId;

  getCurrentUser(req)
    .then(u => {
      if (u) {
        console.log({u})
        var progress = u.progress;
        console.log('progress', progress)
        progress = progress.filter(p => p.habitId.toString() !== habitId.toString());

        UserModel.updateOne(query, {progress})
          .then(r => {
            console.log('removed habit progress??', r)
          })
          .catch(err => {
            console.error('cannot remove habit progress cause', err)
          })
      }
    })
    .catch(err => {
      console.log('remove habit progress: screwed', err)
    })
}

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

  var messages = await MessageModel.find({chatId: telegramId})
  var total = messages.map(m => m.text).join(' ')

  res.json({
    count: messages.length,
    tokens: total.split(' ').length,

    messages,
  })
}


const saveMessagesRoute = async (req, res) => {
  var {chatId, text, sender} = req.body;

  var s = await saveMessage(text, sender, chatId)

  console.log(s, 'save message')
  res.json({
    ok: 1
  })
}

const saveSessionSummaryRoute = async (req, res) => {
  var {telegramId} = req.params;

  var summary = await getSummarizedDialog(telegramId);
  await endSession(telegramId, summary)

  res.json({
    summary
  })
}

const clearUnsuccessfulSummaries = async (req, res) => {
  var {telegramId} = req.params;

  const p = await MessageModel.remove({chatId: telegramId, type: MESSAGE_TYPE_MISTAKEN_SUMMARY})

  res.json({
    p
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
app.get('/edit', renderSPA)
app.get('/admin', renderSPA)
app.get('/quiz', renderSPA)
app.get('/coach', renderSPA)
app.get('/quiz/1', renderSPA)
app.get('/quiz/2', renderSPA)

app.all('/admin/users', getAllUsers)


app.post('/profile', getUser)
app.post('/answer', answerToUserRoute)
app.post('/messages', saveMessagesRoute)
app.get('/summarize/:telegramId', saveSessionSummaryRoute)
app.get('/summaries/flush/:telegramId', clearUnsuccessfulSummaries)
app.get('/messages/:telegramId', getMessagesOfUser)

app.get('/quiz/remove/:telegramId', resetQuizzes)

app.post  ('/quiz/1',           authenticate, saveQuiz(1))
app.post  ('/quiz/2',           authenticate, saveQuiz(2))
app.put   ('/habits',           authenticate, saveHabits)
app.delete('/habits/:habitId',  authenticate, /*isTesting,*/ removeHabitRoute)
app.post  ('/habits/progress',  authenticate, saveHabitProgress)

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