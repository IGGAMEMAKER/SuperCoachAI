const {refreshTokens} = require("./ManagementUtils");
const {
  addIPs,
  prepareAll,
  UpdateSystem,
  UpdateCode,
  UpdateCodeOnServer,
  UpdateCodeOnFrontend,
  StopSystem,
  RunSystem,
  RunFullSystem,
  HealthCheck,

  refreshIPs,
  sleep,
  RestartFrontend,
} = require("./ManagementUtils");

var args = process.argv.slice(2);
var mode = args[0];
console.log('serverManger got args', args);

refreshIPs();

switch (mode) {
  case 'stop': StopSystem(true); break;
  case 'run': RunFullSystem(); break;
  case 'info': HealthCheck(); break;

  case 'install': prepareAll(); break;

  // .commit.sh MOST OFTEN USE
  case 'update': UpdateSystem(args.length >= 2 && args[1] === "l"); break;
  case 'updateCodeAndLibs': UpdateCode(true); break;
  case 'refreshTokens': refreshTokens(); break;


  case 'add':
    if (args.length <= 3) {
      console.error('You need to pass at least 3 parameters: username, password, [IPs]')
      return;
    }

    const username = args[1];
    const password = args[2];

    const ips = args.slice(3);

    console.log('ips', ips);

    addIPs(username, password, ips);
    break;

  case 'site':
    UpdateCodeOnFrontend(false).finally()

    // FRONTEND
    sleep(5)
      .then(async r => {
        await RestartFrontend()
      })
    break;

  default: console.log('unknown mode'); break;
}

module.exports = {
  RunSystem,
  RunFullSystem,
  StopSystem,
  AddServers: addIPs,
}