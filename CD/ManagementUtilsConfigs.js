const servers = require("./Configs/servers");

const projectDir = '/usr/projects/';
const projectName = 'SuperCoachAI'

const gitPath = `${projectDir}${projectName}`;
const pathToConfigs = gitPath + '/CD'

// const frontendURL = 'http://supercoach.site/'
// const frontendURL = 'http://supercoach.site/racing'
const frontendURL = 'https://decompose.site/'
const goToFrontendRoot = ''

const uploadDefaultFiles = false //true
const uploadCertificates = false
const uploadNginxConfig  = false

// const uploadCertificates = true
// const uploadDefaultFiles = true
// const uploadNginxConfig  = true

const sslFiles = [
  // "supercoach_site.crt",
  // "supercoach.site.key",
  // "supercoach_site_chain.crt",
  // "supercoach_site.ca-bundle"
  "decompose_site.crt",
  "decompose.site.key",
  "decompose_site_chain.crt",
  "decompose_site.ca-bundle"
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
