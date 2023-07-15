const createApp = (port) => {
  const express = require('express');
  const cors = require("cors");
  const cookieParser = require('cookie-parser')

  const corsOptions = {
    // origin: '*',
    // origin: 'http://indiemarketingtool.com',
    origin: true,
    credentials: true,            //access-control-allow-credentials:true
    optionSuccessStatus: 200,
  }

  const app = express();

  var path = __dirname.replace('server', 'build')
  console.log('APP.USE', path, __dirname)
  app.use('/static', express.static(path + '/static'));

  app.use(cookieParser())
  app.use(cors(corsOptions))


// http://expressjs.com/en/resources/middleware/body-parser.html
// https://stackoverflow.com/questions/19917401/error-request-entity-too-large
  const limit = '100mb'
  app.use(express.json({limit}));
  app.use(express.urlencoded({ extended: true, limit }));
//app.use(express.urlencoded({limit: '50mb'}));

  app.listen(port);
  const startMeasuring = (req, res, next) => {
    req.t0 = Date.now();
    // console.log(req.method, req.url);
    next();
  }

  app.use(startMeasuring);

  return {
    app,
  };
}

module.exports = createApp;