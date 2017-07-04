
import * as rollbar from 'rollbar';

const rollbarToken = process.env.ROLLBAR_TOKEN;

if(rollbarToken) {
  rollbar.init(rollbarToken);
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

    if(rollbarToken) {
      if(payload) {
        rollbar.handleErrorWithPayloadData(error, payload);
      } else {
        rollbar.handleError(error);
      }
    }
  }
}
