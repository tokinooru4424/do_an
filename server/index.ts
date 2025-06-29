if (!process.env.IS_TS_NODE) {
  // tslint:disable-next-line:no-var-requires
  require('module-alias/register');
}
import Server from '@core/Server'
import Queue from '@app/Queue';

(async () => {
  try {
    let server = new Server();
    Queue.start()
    await server.start()
    require('@app/Services/Cronjob')
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
