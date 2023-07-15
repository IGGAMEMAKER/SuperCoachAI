const {app} = require('./expressGenerator')(3333);

// const {UserModel} = require('./Models')

const renderSPA = (req, res) => {
  var appPath = __dirname.replace('server', 'build') + '/index.html'
  res.sendFile(appPath);
}


// ROUTES
app.get('/', renderSPA)

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