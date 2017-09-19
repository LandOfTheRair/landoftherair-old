
import * as Rollbar from 'rollbar';

let rollbar = null;

const rollbarToken = process.env.ROLLBAR_TOKEN;

if(rollbarToken) {
  rollbar = new Rollbar({
    accessToken: rollbarToken,
    handleUncaughtExceptions: true,
    handleUnhandledRejections: true
  })
}

export class Logger {

  static _formatMessage( message) {
    return `[${new Date()}] ${message}`;
  }

  static log(msg: string) {
    console.log(this._formatMessage(msg));
  }

  static error(error: string|Error, payload?) {
    console.error(this._formatMessage(error));

    if((<Error>error).stack) {
      console.error((<Error>error).stack);
    }

    if(rollbarToken) {
      if(payload) {
        rollbar.error(error, null, payload);
      } else {
        rollbar.error(error);
      }
    }
  }
}
