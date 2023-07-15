const IPs = require("./IPs");

const PORT_FRONTEND = 3333;
const PORT_WORKER = 3334;
const PORT_DB = PORT_FRONTEND; // 3335;
const PORT_FLOOR_TRACKER = 3336;
const PORT_LOGGER = 3340;
const PORT_SERVER_MANAGER = PORT_LOGGER; //3341;
const PORT_WEB3 = 3339;

const workerIndex       = 0;
const LOGGER_IP         = IPs[0];
const DB_IP             = IPs[0];
const FRONTEND_IP       = IPs[0];
const WEB3_IP           = IPs[0];
const FLOOR_TRACKER_IP  = IPs[0];
const SERVER_MANAGER_IP = LOGGER_IP; //IPs[5];

const isFrontend      = ip => FRONTEND_IP.includes(ip);
const isDB            = ip => DB_IP.includes(ip);
const isLogger        = ip => LOGGER_IP.includes(ip);
const isWEB3          = ip => WEB3_IP.includes(ip);
const isFloorTracker  = ip => FLOOR_TRACKER_IP.includes(ip);
const isServerManager = ip => SERVER_MANAGER_IP.includes(ip);

const isRemote    = ip => !ip.includes('localhost');

const getServerType = ip => {
  // if (isServerManager(ip))
  //   return "Manager";

  if (isDB(ip))
    return "DB"

  if (isLogger(ip))
    return "Logger";

  if (isFrontend(ip))
    return "Frontend"

  return "Worker";
}

const isWorker = ip => getServerType(ip).includes("Worker");

const formatServerName = ip => getServerType(ip) + ` (${ip})`

module.exports = {
  IPs,
  REMOTE:       IPs.filter(isRemote),

  WORKERS:      IPs.slice(workerIndex).map(ip => ip + ':' + PORT_WORKER),
  WORKERS_IP:   IPs.slice(workerIndex),

  DB:       DB_IP        + ':' + PORT_DB,

  getServerType,
  formatServerName,

  DB_IP, LOGGER_IP, FRONTEND_IP, WEB3_IP, FLOOR_TRACKER_IP, SERVER_MANAGER_IP,

  PORT_DB, PORT_WORKER, PORT_LOGGER, PORT_FRONTEND, PORT_WEB3, PORT_FLOOR_TRACKER, PORT_SERVER_MANAGER,
  isDB, isWorker, isLogger, isFrontend, isWEB3, isFloorTracker, isServerManager
}
