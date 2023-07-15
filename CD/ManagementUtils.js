const fs = require('fs')
const path = require('path')
const servers = require("./Configs/servers");
const {getServerType, formatServerName} = require("./Configs/servers");
const {NodeSSH} = require('node-ssh')

const open = require('open')
const {isLogger} = require("./Configs/servers");

const projectDir = '/usr/marketing/';
const projectName = 'IndieMarketingTool'
const gitPath = `${projectDir}${projectName}`;

const frontendURL = 'http://www.indiemarketingtool.com'

const {gitUsername, gitToken} = require('./Configs/Passwords');

const printStdOut = chunk => {
  console.log('stdout', chunk.toString('utf8'))
}
const onStdout = (chunk) => {
  //console.log('stdout', chunk.toString('utf8'))
}
const onStderr = (chunk) => {
  //console.log('stdERROR', chunk.toString('utf8'))
}

const idle = chunk => {};

const silent = { onStdout: idle, onStderr: idle};
const handlers = silent; //{onStdout, onStderr};
const errOnly = {onStdout: idle, onStderr};

const conn = async ip => {
  const ssh = new NodeSSH()

  try {
    console.log(`CONNECTED to ${ip}!`);
    return ssh.connect(getSSHConfig(ip));

    return ssh;
  } catch (err) {
    console.error('Connection failed', err);

    return null;
  }
}

const conn2 = async (ip, username, password) => {
  const ssh = new NodeSSH()

  var conf2 = {
    host: ip,
    username,
    password,
  }

  try {
    console.log(`CONNECTED to ${ip}!`);
    return ssh.connect(conf2);

    return ssh;
  } catch (err) {
    console.error('Connection failed', err);

    return null;
  }
}

const logError = (checklist, text, err) => {
  console.error(text, err); //, err, checklist);
}

const crawlerOptions = {
  cwd: gitPath,
  onStdout,
  onStderr,
};

const refreshTokens = () => {
  servers.REMOTE.forEach(async ip => {
    var ssh = await conn(ip);

    await uploadConfigs(ssh, ip, {});
    await sleep(1);

    try {
      // https://stackoverflow.com/questions/2432764/how-to-change-the-uri-url-for-a-remote-git-repository
      await ssh.exec(`git remote set-url origin https://${gitToken}@github.com/${gitUsername}/OpenseaCrawler.git`, [], crawlerOptions)
    }
    catch (err) {
      console.error('UPDATE GITHUB TOKEN', err);
    }

    console.log('updated??!', ip)
  })
  // console.log('ALL DONE. You can CTrl-C')
}

const prepareServer = async (ip, forceProjectRemoval = false) => {
  const check = {};

  console.log('PREPARING ' + ip);

  const ssh = await conn(ip);
  check['connected'] = true;

  if (forceProjectRemoval) {
    try {
      await ssh.exec(`rm -rf ${projectDir}`, [], crawlerOptions)
    } catch (err) {
      console.error('could not remove dir\nABORTING', err);
      return;
    }
  }

  await ssh.mkdir(projectDir)
    .catch(err => err);

  check['made_dir'] = true;
  console.log('made a dir')

  await cloneRepo(ssh);
  check['cloned_repo'] = true;
  await openPorts(ssh);
  check['opened_ports'] = true;

  await updateAPT(ssh, check);


  await installNPM(ssh, check);
  await installPM2(ssh, check);
  await installN(ssh, check);

  await installNodeWithN(ssh, check);

  await gitPull(ssh, ip, true);

  await checkEnvironmentStatus(ssh, ip)
}

const uploadFile = (ssh, local, remote) => {
  return ssh.putFile(local, remote)
    .then(r => {
      //console.log(`UPLOADED ${remote}`);
    })
    .catch(r => {
      //console.log(`FAILED to upload ${remote}`)
    })
}

const uploadAndLog = async (ssh, local, remote, filename) => {
  return uploadFile(ssh, local, remote)
    .then(r => {
      console.log(`${filename} uploaded OK`);
    })
    .catch(err => {
      logError({}, `${filename} upload failed`, err);
    });
}

const uploadConfigs = async (ssh, ip, check = {}) => {
  var pathToConfigs = gitPath + '/app/my-app/CD'
  // Main Configs
  await uploadAndLog(ssh, './Configs/confs.json', pathToConfigs + '/Configs/confs.json', 'confs.json')

  // Passwords.js
  await uploadAndLog(ssh, './Configs/Passwords.js', pathToConfigs + '/Configs/Passwords.js', 'Passwords.js')

  // hosts.json
  await uploadAndLog(ssh, './Configs/hosts.json', pathToConfigs + '/Configs/hosts.json', 'hosts.json')

  // Server IP
  const myHost = `./Configs/myHost-${ip}.js`;
  const content = `module.exports = { ip: "${ip}" };` // module.exports = { ip: 'http://localhost' };
  fs.writeFileSync(myHost, content)

  await uploadAndLog(ssh, myHost, pathToConfigs + '/Configs/myHost.js', 'myHost.js')
}

const gitPull = async (ssh, ip, updateNPMLibs = false, check = {}) => {
  console.log('trying to UPDATE CODE');

  await uploadConfigs(ssh, ip, check);

  //await cloneRepo(ssh);
  // await ssh.exec('rm -fr ".git/rebase-apply"', [], crawlerOptions)
  //   .finally()
  // await ssh.exec('git checkout\ngit pull --rebase --autostash', [], crawlerOptions)
  await ssh.exec('git pull', [], crawlerOptions)
    .then(r => {
      check['pull'] = true;

      console.log('code pulled')
    })
    .catch(err => {
      check['pull'] = false;

      logError(check, 'code pulling failed', err);
    })

  if (updateNPMLibs) {
    console.log('wanna update npm libs');

    await ssh.exec('npm i --force', [], crawlerOptions)
      .then(r => {
        check['npm_install_packages'] = true;
        console.log('npm libs updated?');
      })
      .catch(err => {
        check['npm_install_packages'] = false;

        console.error('updating packages failed', err);
        //logError(check, 'updating packages failed', err);
      })
  }
}

const resetGitDirectory = async (ssh, ip) => {
  await ssh.exec(`rm ${projectDir}`, [], crawlerOptions)
    .catch(err => err);

  console.log('RM dir')

  await ssh.mkdir(projectDir)
    .catch(err => err);

  console.log('made a dir')

  await cloneRepo(ssh);
}


const installNodeWithN = async ssh => {
  await ssh.exec('n i lts', [], handlers);
  await ssh.exec('PATH="$PATH"', [], handlers);
  await ssh.exec('n use lts', [], handlers);
}

const installN = async (ssh, check) => {
  await ssh.exec('npm install -g n', [], handlers)
    .then(r => {
      check['N'] = true;
    })
    .catch(err => {
      check['N'] = false;
      logError(check, 'N installation failed', err);
    })
}


const checkEnvironmentStatus = async (ssh, ip) => {
  console.log('checkEnvironmentStatus');

  console.log('NPM ');
  await ssh.exec('npm -v', [], handlers);

  console.log('NODE');
  await ssh.exec('node -v', [], handlers);

  console.log('PM2');
  await ssh.exec('pm2 -v', [], handlers);
}

const updateAPT = async (ssh, check) => {
  await ssh.exec('apt-get update', [], handlers)
    .then(r => {
      check['apt'] = true;
      console.log('Updated APT');
    })
    .catch(err => {
      check['apt'] = false;
      logError(check,'APT update failed', err);
    })
}

const installNPM = async (ssh, check) => {
  await ssh.exec('apt -y install npm', [], handlers)
    .then(r => {
      check['npm'] = true;
      console.log('NPM Installed');
    })
    .catch(err => {
      check['npm'] = false;
      logError(check,'Error while installing NPM', err);
    })
}

const installPM2 = async (ssh, check) => {
  await ssh.exec('npm install pm2 -g', [], handlers)
    .then(r => {
      check['PM2'] = true;
      console.log('PM2 INSTALLED')
    })
    .catch(err => {
      check['PM2'] = false;
      logError(check, 'PM2 INSTALL FAILED', err);
    });
}


const openPorts = async (ssh) => {
  await openPort(ssh, servers.PORT_LOGGER);
  await openPort(ssh, servers.PORT_DB);
  await openPort(ssh, servers.PORT_FRONTEND);
  await openPort(ssh, servers.PORT_WORKER);
  await openPort(ssh, servers.PORT_WEB3);
  await openPort(ssh, servers.PORT_FLOOR_TRACKER);
  //await openPort(ssh, servers.PORT_SERVER_MANAGER);
}
const openPort = async (ssh, port) => await ssh.exec(`ufw allow ${port}/tcp`, [], handlers);

const encodeToken = str => {
  const repl = (str, symbol, rep) => {
    for (var ii = 0; ii < 7; ii++) {
      str = str.replace(symbol, rep);
    }

    return str;
  }

  str = repl(str, ')', '%29');
  str = repl(str, '(', '%28');
  str = repl(str, '@', '%40');
  str = repl(str, '*', '%2A');
  str = repl(str, ':', '%3A');

  return str;
}
const cloneRepo = async (ssh) => {
  const clone = `git clone https://${encodeToken(gitToken)}@github.com/${gitUsername}/${projectName}.git`

  console.log('trying to clone', clone);

  await ssh.exec(clone, [], {
    cwd: projectDir,
    onStdout,
    onStderr,
  })
    .catch(err => {
      console.log(err);
      console.log('AUF');
    })
}


const getIPProfile = (ip) => {
  return getHostsManually().find(h => h.ip === ip);
}

const getSSHConfig = ip => {
  var p = getIPProfile(ip);

  return {
    host: ip,
    username: p.username,
    password: p.password,
  }
}

const prepareAll = () => {
  servers.REMOTE.forEach((ip, i) => {
    prepareServer(ip);
  })
}

const sleep = async (seconds, ssh) => {
  if (ssh)
    return ssh.exec(`sleep ${seconds}`, [], handlers);

  return new Promise(res => {
    setTimeout(() => { res(1) }, seconds * 1000);
  })
}

const UpdateCodeOnServer = async (ip, updateNPMLibs = false) => {
  const ssh = await conn(ip);

  await gitPull(ssh, ip, updateNPMLibs, {});
}

const UpdateCodeOnFrontend = async (updateNPMLibs = false) => {
  await UpdateCodeOnServer(servers.FRONTEND_IP, updateNPMLibs);
}

const UpdateCode = async (updateNPMLibs = false) => {
  servers.REMOTE.forEach(async ip => {
    await UpdateCodeOnServer(ip, updateNPMLibs)
    // const ssh = await conn(ip);
    //
    // gitPull(ssh, ip, updateNPMLibs, {});
  })
};

const UpdateRepos = async (updateNPMLibs = false) => {
  servers.REMOTE.forEach(async ip => {
    const ssh = await conn(ip);

    resetGitDirectory(ssh, ip);
  })
}

const UpdateSystem = async (updateNPMLibs = false) => {
  UpdateCode(updateNPMLibs);

  setTimeout(RunFullSystem, 8000);
}

const StopSystem = async (forceLogStopping = false) => {
  var stoppable = servers.REMOTE.filter(ip => {
    var logger = isLogger(ip);

    return !logger || forceLogStopping;
  })

  stoppable.forEach(async ip => {
    const ssh = await conn(ip);

    StopServer(ssh);
  })
}

const RestartFrontend = async () => {
  const ssh = new NodeSSH();

  var ip = servers.FRONTEND_IP

  console.log('RestartFrontend on ' + ip);

  await ssh.connect(getSSHConfig(ip))

  var check = {}
  // await ssh.exec('cd app/my-app/', [], crawlerOptions)
  //   .finally()
  await ssh.exec('cd app/my-app/ ; npm run build', [], crawlerOptions)
    .then(r => {
      check['pull'] = true;

      console.log('BUILT')
    })
    .catch(err => {
      check['pull'] = false;

      logError(check, 'BUILD failed', err);
    })

  const url = frontendURL
  console.log('Trying to open', url);

  await countdown(2);

  console.log('You can start using website');
  await open(url);
}

const countdown = async seconds => {
  for (var i = seconds; i >= 0; i--) {
    await sleep(1);
    console.log('Will open in ' + i + 's ...');
  }
}

const RunFullSystem = async () => {
  /*await RunService(servers.SERVER_MANAGER_IP, 'ManagementUtils', 'Core');
  await sleep(2);*/

  // LOGGER (Which is MANAGER SERVER, actually)
  // await RunService(servers.LOGGER_IP, 'LogServer', 'LG');
  // await sleep(2);

  await RunSystem();
}

const RunSystem = async () => {
  /*// LOGGER
  await RunService(servers.LOGGER_IP, 'LogServer', 'LG');
  await sleep(2);*/

  // FLOOR TRACKER
  // await RunService(servers.FLOOR_TRACKER_IP, 'FloorTracker', 'TR')

  // WORKERS
  // servers.WORKERS_IP.forEach(ip => {
  //   RunService(ip, 'Worker', 'WK')
  // })

  // await sleep(3)

  // DB
  await RunService(servers.DB_IP, 'app/my-app/server/server', 'DB');
  // await sleep(10);

  // FRONTEND
  await RestartFrontend();
}

const StopServer = async (ssh) => {
  await ssh.exec('pm2 delete all', [], handlers)
    .then(r => r)
    .catch(r => r);
  await ssh.exec('pm2 flush', [], handlers)
    .then(r => r)
    .catch(r => r);

  console.log('stopped server');
}

const RunService = async (ip, scriptName, appName = scriptName) => {
  const ssh = new NodeSSH();

  console.log('Trying to run service ' + scriptName + ' on ' + ip);

  await ssh.connect(getSSHConfig(ip))
    .then(async r => {
      await StopServer(ssh);

      console.log('Stopped server ' + ip)

      await ssh.exec(`pm2 start ${scriptName}.js --name ${appName}`, [], { cwd: gitPath, onStderr, onStdout })
        .then(r => {
          console.log('started ' + scriptName + '.js on ' + ip);
        })
        .catch(err => {
          logError({}, 'cannot start ' + scriptName + '.js on ' + ip, err);
        });
    })
    .catch(err => {
      console.error('ERROR WHEN RUNNING SERVICE', ip, scriptName, err);
    })
}

const HealthCheck = () => {
  servers.REMOTE.forEach(async ip => {
    const ssh = await conn(ip);


    await ssh.exec(`pm2 list`, [], { cwd: gitPath, onStderr, onStdout: idle })
      .then(async r => {
        console.log(formatServerName(ip));
        console.log(r)
      })
  })
}

const hostJSONPath = "./Configs/hosts.json";
const getHostsManually = () => JSON.parse(fs.readFileSync(hostJSONPath));

const refreshIPs = () => {
  // make IPs file from hosts
  const IPonly = getHostsManually().map(h => h.ip);

  const ipStringified = JSON.stringify(IPonly, null, 2);
  //console.log(ipStringified);

  const data = `// Logger\n// DB\n// FRONTEND\n// WEB3\n\nconst IPs = ${ipStringified}\n\nmodule.exports = IPs;\n`;
  //console.log(data);

  fs.writeFileSync("./Configs/IPs.js", data)
}

const addIPs = async (username, password, IPs) => {
  const hosts = getHostsManually();

  IPs.forEach(ip => {
    var ind = hosts.findIndex(h => h.ip === ip);
    const h = { ip, password, username };

    if (ind >= 0)
      hosts[ind] = h;
    else
      hosts.push(h)
  })

  fs.writeFileSync(hostJSONPath, JSON.stringify(hosts, null, 2));
  refreshIPs();

  IPs.forEach(ip => {
    prepareServer(ip);
  })
}

module.exports = {
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
  refreshTokens,

  refreshIPs,
  sleep,
  RestartFrontend,

  conn,
  openPorts
}