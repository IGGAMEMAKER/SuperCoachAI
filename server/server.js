const {app} = require('./expressGenerator')(3333);

const {UserModel} = require('./Models')

const renderSPA = (req, res) => {
  var appPath = __dirname.replace('server', 'build') + '/index.html'
  res.sendFile(appPath);
}

const getUser = async (req, res) => {
  console.log('getUser', req.body)
  var telegramId = req.body.telegramId
  console.log({telegramId})

  UserModel.find({telegramId})
    .then(u => {
      var mockUser = {telegramId, habits: []}

      console.log({u})
      // save cookies
      if (!u) {
        u = new UserModel(mockUser)

        u.save()
          .then(r => {
            console.log('user saved', r)
            res.json({profile: mockUser})
          })
          .catch(err => {
            console.error({err})
            res.json({profile: mockUser, error: 1})
          })
      } else {
        res.json({profile: u}) // progress??
      }
    })
}

const authenticate = async (req, res, next) => {
  // get telegramId here
  var telegramId = '' // req.cookies(???) req.body?

  var u = await UserModel.find({telegramId})

  if (!u) {
    u = new UserModel({telegramId, habits: []})

    await u.save()
  } else {

  }

  req.telegramId = telegramId
  next()
}

const saveHabits = async (req, res) => {
  var r = await UserModel.updateOne(
    {telegramId: req.telegramId},
    {habits: req.body.habits}
  )

  console.log({r})

  res.json({r})
}

var seq = (progress) => progress.map((p, i) => ({
  date: new Date(Date.now() - i * 24 * 3600 * 1000),
  progress: p
}))

// ROUTES
app.get('/', renderSPA)
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

app.post('/habits', authenticate, saveHabits)
app.post('/habits/progress', authenticate, (req, res) => {
  // add/remove progress here
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