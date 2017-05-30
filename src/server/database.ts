
import { MongoClient } from 'mongodb';
import { Logger } from './logger';

const DB_URI = process.env.MONGODB_URI;
if(!DB_URI) {
  Logger.error('No env.MONGODB_URI set. Set one.');
  process.exit(0);
}

class Database {

  public isReady: Promise<any>;

  public $accounts: any;
  public $players: any;

  private client: MongoClient;

  constructor() {
    this.isReady = new Promise((resolve, reject) => {

      MongoClient.connect(DB_URI, (err, client) => {
        if(err) {
          return reject(err);
        }

        Logger.log('MongoDB Connected');

        this.client = client;
        this.$accounts = client.collection('accounts');
        this.$accounts.ensureIndex({ userId: 1 });

        this.$players = client.collection('players');
        this.$players.ensureIndex({ username: 1, charSlot: 1 });

        resolve();
      });

    });
  }
}

export const DB = new Database();
