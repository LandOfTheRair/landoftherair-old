
export class Logger {
  static log(msg: string) {
    console.log(`[${new Date()}] ${msg}`);
  }

  static error(msg: string|Error) {
    console.error(new Date(), msg);
  }
}
