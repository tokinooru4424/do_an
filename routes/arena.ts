import Arena from 'bull-arena'
import Route from '@core/Routes'
import Bull from 'bull'
import appConfig from '@root/config/app';
import redisConfig from '@root/config/redis';

const AuthApiMiddleware = require('@app/Middlewares/AuthApiMiddleware');
const { REDIS_HOST, REDIS_PORT, REDIS_PASS, REDIS_QUEUE_DB, REDIS_QUEUE_PREFIX } = redisConfig

const arena = async () => {
  if (!appConfig.ENABLE_ARENA) return;

  let queues = [
    {
      name: `sendMail-${REDIS_QUEUE_DB}`,
      hostId: REDIS_QUEUE_PREFIX,
      prefix: REDIS_QUEUE_PREFIX,
      type: 'bull',
      redis: {
        port: REDIS_PORT,
        host: REDIS_HOST,
        password: REDIS_PASS,
        db: REDIS_QUEUE_DB
      },
    }
  ]

  let arenaQ = Arena(
    {
      Bull,
      queues: queues,
    },
    {
      // Make the arena dashboard become available at {my-site.com}/arena.
      basePath: '/',

      // Let express handle the listening.
      disableListen: true
    });

  Route.router.use("/arena", AuthApiMiddleware, arenaQ);
}

arena();
