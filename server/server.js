const {isHabitDoneOnDayX} = require("../utils");
const {app} = require('./expressGenerator')(3333);

const {UserModel, MessageModel} = require('./Models')

const getCookies = req => {
  return {
    telegramId: req.cookies["telegramId"]
  }
}
// const generateCookies = async (res, telegramId) => {
//   var token = createSessionToken(email)
//   setCookies(res, token)
//
//   await UserModel.updateOne({
//     email,
//     sessionToken: {$exists: false}
//   }, {
//     sessionToken: token,
//     sessionCreatedAt: new Date()
//   })
// }
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
  console.log({telegramId})

  UserModel.findOne({telegramId})
    .then(u => {
      var mockUser = {telegramId, habits: []}

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

// ROUTES
app.get('/', renderSPA)
app.get('/admin', renderSPA)
app.post('/profile', getUser)

// app.get('/profile', (req, res) => {
//   res.json({
//     habits: [
//       {
//         name: 'Cold shower',
//         progress: seq([true, false, true, false]),
//         from: '8:45', to: '9:25',
//         schedule: [0, 1, 2, 3, 4, 5, 6]
//       },
//       {
//         name: 'Breathing',
//         progress: seq([true, true, true, true]),
//         from: '9:35', to: '9:45',
//         schedule: [0, 1, 2, 3, 4]
//       },
//     ]
//   })
// })

app.all('/admin/users', (req, res) => {
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
})

app.put('/habits', authenticate, saveHabits)
app.post('/habits/progress', authenticate, (req, res) => {
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
})

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