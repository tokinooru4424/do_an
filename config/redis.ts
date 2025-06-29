import Env from '@core/Env';

export default {
  REDIS_HOST: Env.get("REDIS_HOST", "localhost"),
  REDIS_PORT: Env.get("REDIS_PORT", "6379"),
  REDIS_DB: Env.get("REDIS_DB", 3),
  REDIS_PASS: Env.get("REDIS_PASS", ""),
  REDIS_QUEUE_PREFIX: Env.get("REDIS_QUEUE_PREFIX", "Hactech"),
  REDIS_QUEUE_DB: Env.get("REDIS_QUEUE_DB", 3),
  REDIS_CLEAN_JOB_MAIL: Env.get("REDIS_CLEAN_JOB_MAIL", 3),
};
