const fs = require('fs')
const open = require('open')
const {NodeSSH} = require('node-ssh')

const servers = require("./Configs/servers");
const {formatServerName} = require("./Configs/servers");
const {hostsJSONPath, serviceList, mainConfigs, pathToConfigs, sslFiles, projectName, uploadNginxConfig, uploadCertificates, uploadDefaultFiles, gitPath, projectDir, runFrontendConfigs, frontendURL, goToFrontendRoot} = require("./ManagementUtilsConfigs");

const {gitUsername, gitToken} = require('./Configs/Passwords');

const runServices = services => {
  services.forEach(async cfg => {
    await RunService(cfg.ip, cfg.scriptName, cfg.app)
  })
}

const RunSystem = async () => {
  runServices(serviceList)

  // DB
  // await RunService(servers.DB_IP, 'server/server', 'DB');

  // FRONTEND
  await RestartFrontend();
}

const RestartFrontend = async () => {
  console.log('RestartFrontend');

  const ssh = await conn(servers.FRONTEND_IP)

  runServices(runFrontendConfigs)

  await BuildFrontendApp(ssh)

  // await countdown(2);

  await open(frontendURL);
}


/// STANDARD stuff
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

    await uploadConfigs(ssh, ip);
    await sleep(1);

    console.log('updated??!', ip)
  })
}

const loadLibs = async (ssh, check={}) => {
  await updateAPT(ssh, check);


  await installNPM(ssh, check);
  await installPM2(ssh, check);
  await installN(ssh, check);

  await installNodeWithN(ssh, check);
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

  await loadLibs(ssh, check)

  await gitPull(ssh, ip, true);

  await checkEnvironmentStatus(ssh, ip)
}

const uploadAndLog = async (ssh, local, remote) => {
  return ssh.putFile(local, remote)
    .then(r => {
      console.log(`${local} uploaded OK`);
    })
    .catch(err => {
      logError({}, `${local} upload failed`, err);
    });
}

const uploadFileFromConfigsFolder = async (ssh, file) => {
  await uploadAndLog(ssh, './Configs/' + file, pathToConfigs + '/Configs/' + file);
}
const uploadFiles = (ssh, files) => {
  files.forEach(async f => {
    await uploadFileFromConfigsFolder(ssh, f)
  })
}

const uploadConfigs = async (ssh, ip) => {
  if (uploadDefaultFiles) {
    uploadFiles(ssh, mainConfigs)

    // Server IP
    const myHost = `./Configs/myHost-${ip}.js`;
    const content = `module.exports = { ip: "${ip}" };` // module.exports = { ip: 'http://localhost' };
    fs.writeFileSync(myHost, content)

    await uploadAndLog(ssh, myHost, pathToConfigs + '/Configs/myHost.js')
  }

  if (uploadCertificates) {
    uploadFiles(ssh, sslFiles)
  }

  if (uploadNginxConfig) {
    const nginxName = projectName.toLowerCase()

    try {
      await uploadAndLog(ssh, './Configs/nginx', '/etc/nginx/sites-available/' + nginxName)
      await ssh.exec(`ln -s /etc/nginx/sites-available/${nginxName} /etc/nginx/sites-enabled/${nginxName}`, [], crawlerOptions)
    } catch (e) {
      console.log('MAKE A SYMLINK FOR NGINX CONFIG! + RESTART NGINX MAYBE?')
      console.log('MAKE A SYMLINK FOR NGINX CONFIG! + RESTART NGINX MAYBE?')
      console.log('MAKE A SYMLINK FOR NGINX CONFIG! + RESTART NGINX MAYBE?')
      console.log('MAKE A SYMLINK FOR NGINX CONFIG! + RESTART NGINX MAYBE?')
      console.log('MAKE A SYMLINK FOR NGINX CONFIG! + RESTART NGINX MAYBE?')
    }

    try{
      await ssh.exec(`nginx -t`, [], crawlerOptions)
    } catch (e) {}
    try {
      await ssh.exec(`service nginx restart`, [], crawlerOptions)
    } catch (e) {}
  }
}

const gitPull = async (ssh, ip, updateNPMLibs = false, check = {}) => {
  console.log('trying to UPDATE CODE');

  await uploadConfigs(ssh, ip);

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
  Object.values(servers.PORTS).forEach(async p => {
    await openPort(ssh, p)
  })
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

const getHostsManually = () => JSON.parse(fs.readFileSync(hostsJSONPath));

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
  })
};

const UpdateSystem = async (updateNPMLibs = false) => {
  UpdateCode(updateNPMLibs);

  setTimeout(RunFullSystem, 8000);
}

const StopSystem = async () => {
  servers.REMOTE.forEach(async ip => {
    const ssh = await conn(ip);

    StopServer(ssh);
  })
}


const countdown = async seconds => {
  for (var i = seconds; i >= 0; i--) {
    await sleep(1);
    console.log('Will open in ' + i + 's ...');
  }
}

const RunFullSystem = async () => {
  await RunSystem();
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

const BuildFrontendApp = async (ssh) => {
  var check = {}

  await ssh.exec(`${goToFrontendRoot} npm run build`, [], crawlerOptions)
    .then(r => {
      check['pull'] = true;

      console.log('BUILT')
    })
    .catch(err => {
      check['pull'] = false;

      logError(check, 'BUILD failed', err);
    })
}

const RunService = async (ip, scriptName, appName) => {
  console.log('Trying to run service ' + scriptName + ' on ' + ip);

  // const ssh = new NodeSSH();
  //
  // await ssh.connect(getSSHConfig(ip))

  try {
    const ssh = await conn(ip)
    // await StopServer(ssh)

    // stop service (if had any)
    await ssh.exec(`pm2 delete ${appName}-${projectName}`, [], {cwd: gitPath, onStderr, onStdout})
      .then(r => {
        console.log('deleted service ' + scriptName + '.js on ' + ip);
      })
      .catch(err => {
        logError({}, 'cannot delete ' + scriptName + '.js on ' + ip, err);
      });

    console.log('Stopped service ' + appName + ' on ' + ip)

    // start service
    await ssh.exec(`pm2 start ${scriptName}.js --name ${appName}-${projectName}`, [], {cwd: gitPath, onStderr, onStdout})
      .then(r => {
        console.log('started ' + scriptName + '.js on ' + ip);
      })
      .catch(err => {
        logError({}, 'cannot start ' + scriptName + '.js on ' + ip, err);
      });
  } catch (err) {
    console.error('ERROR WHEN RUNNING SERVICE', ip, scriptName, err);
  }

  // .then(async r => {
  // })
  // .catch(err => {
  //   console.error('ERROR WHEN RUNNING SERVICE', ip, scriptName, err);
  // })
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

const refreshIPs = () => {
  // make IPs file from hosts
  const IPonly = getHostsManually().map(h => h.ip);

  const ipStringified = JSON.stringify(IPonly, null, 2);

  const data = `// Is automatically generated from hosts.json\n\nconst IPs = ${ipStringified}\n\nmodule.exports = IPs;\n`;

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

  fs.writeFileSync(hostsJSONPath, JSON.stringify(hosts, null, 2));
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