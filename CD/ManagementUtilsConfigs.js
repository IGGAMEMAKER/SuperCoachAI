const servers = require("./Configs/servers");

const projectDir = '/usr/projects/';
const projectName = 'SuperCoachAI'

const gitPath = `${projectDir}${projectName}`;
const pathToConfigs = gitPath + '/CD'

// const frontendURL = 'http://supercoach.site/'
const frontendURL = 'http://supercoach.site/racing'
const goToFrontendRoot = ''

const uploadCertificates = false
const uploadDefaultFiles = true
const uploadNginxConfig  = false

// const uploadCertificates = true
// const uploadDefaultFiles = true
// const uploadNginxConfig  = true

const sslFiles = [
  "supercoach_site.crt",
  "supercoach.site.key",
  "supercoach_site_chain.crt",
  "supercoach_site.ca-bundle"
]

const mainConfigs = [
  'confs.json',
  'Passwords.js',
  'hosts.json',
]

const serviceList = [
  {ip: servers.DB_IP, scriptName: 'server/server', app: 'DB'}
]

const runFrontendConfigs = [] // empty if frontend is on same server as backend

const hostsJSONPath = "./Configs/hosts.json";

module.exports = {
  projectDir,
  projectName,
  gitPath,
  pathToConfigs,
  frontendURL,
  goToFrontendRoot,
  uploadCertificates,
  uploadDefaultFiles,
  uploadNginxConfig,
  sslFiles,
  hostsJSONPath,

  serviceList,
  runFrontendConfigs,

  mainConfigs,
}
