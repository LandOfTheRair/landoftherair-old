
import * as NRP from 'node-redis-pubsub';
import { Logger } from './logger';

const REDIS_URL = process.env.REDIS_URL;
if(!REDIS_URL) {
  Logger.error('No env.REDIS_URL set. Set one.');
  process.exit(0);
}

class RedisWrapper {

  private _client: NRP;

  public get client(): NRP {
    return this._client;
  }

  async init() {
    if(this._client) throw new Error('Cannot re-init Redis');
    this._client = new NRP({ url: REDIS_URL });
  }

}

export const Redis = new RedisWrapper();
