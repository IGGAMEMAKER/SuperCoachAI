const IPs = require("./IPs");

const PORTS = {
  PORT_DB: 3333
}

const isRemote    = ip => !ip.includes('localhost')

const DB_IP             = IPs[0]
const FRONTEND_IP       = IPs[0]
const LOGGER_IP         = IPs[0]

const isDB            = ip => DB_IP.includes(ip)
const isFrontend      = ip => FRONTEND_IP.includes(ip)
const isLogger        = ip => LOGGER_IP.includes(ip)


const getServerType = ip => {
  if (isDB(ip)) return "DB"
  if (isFrontend(ip)) return "Frontend"
  if (isLogger(ip)) return "Logger"

  return "Worker"
}

const formatServerName = ip => getServerType(ip) + ` (${ip})`

module.exports = {
  IPs,
  REMOTE: IPs.filter(isRemote),
  PORTS,

  // auxiliaries
  DB: DB_IP + ':' + PORTS.PORT_DB, // TODO not used??
  getServerType, // TODO not used?
  formatServerName, // health check only


  DB_IP, // ManagementUtils.js
  FRONTEND_IP, // ManagementUtils
  LOGGER_IP,
}
