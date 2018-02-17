
import * as NRP from 'node-redis-pubsub';
import { Logger } from './logger';

const REDIS_URL = process.env.REDIS_URL;
if(!REDIS_URL) {
  Logger.error('No env.REDIS_URL set. Set one.');
  process.exit(0);
}

export class Redis {

  private _client: NRP;

  public get client(): NRP {
    return this._client;
  }

  constructor() {
    this.init();
  }

  private async init() {
    if(this._client) throw new Error('Cannot re-init Redis');
    this._client = new NRP({ url: REDIS_URL });

    this._client.on('error', (e) => {
      Logger.error(e);
    });
  }

}
