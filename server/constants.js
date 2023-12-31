const MESSAGE_TYPE_DEFAULT = 0;
const MESSAGE_TYPE_SUMMARY = 2;
const MESSAGE_TYPE_MISTAKEN_SUMMARY = 22;

const SENDER_GPT = "-2";
const SENDER_ADMIN = "-1"

const SESSION_STATUS_NULL = 0
const SESSION_STATUS_AI_RESPONDED = 1
const SESSION_STATUS_ADMIN_RESPONDED = 5

const SESSION_STATUS_USER_RESPONDED = 3
const SESSION_STATUS_WANNA_CLOSE_SESSION = 4
const SESSION_STATUS_SESSION_SUMMARIZED = 2
const SESSION_STATUS_SESSION_MISTAKENLY_SUMMARIZED = 22

module.exports = {
  MESSAGE_TYPE_DEFAULT,
  MESSAGE_TYPE_SUMMARY,
  MESSAGE_TYPE_MISTAKEN_SUMMARY,
  SENDER_GPT,
  SENDER_ADMIN,
  SESSION_STATUS_NULL,
  SESSION_STATUS_AI_RESPONDED,
  SESSION_STATUS_ADMIN_RESPONDED,
  SESSION_STATUS_USER_RESPONDED,
  SESSION_STATUS_WANNA_CLOSE_SESSION,
  SESSION_STATUS_SESSION_SUMMARIZED,
  SESSION_STATUS_SESSION_MISTAKENLY_SUMMARIZED
}