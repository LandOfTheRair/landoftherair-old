
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
  public $items: any;
  public $npcs: any;
  public $mapDrops: any;
  public $regionDrops: any;
  public $mapGroundItems: any;
  public $characterLockers: any;
  public $mapBossTimers: any;
  public $lobbySettings: any;
  public $logs: any;

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
        this.$accounts.ensureIndex({ username: 1 }, { unique: true });

        this.$players = client.collection('players');
        this.$players.ensureIndex({ username: 1, charSlot: 1 });
        this.$players.ensureIndex({ username: 1, map: 1, charSlot: 1 });

        this.$items = client.collection('items');
        this.$items.ensureIndex({ name: 1 }, { unique: true });

        this.$npcs = client.collection('npcs');
        this.$npcs.ensureIndex({ npcId: 1 }, { unique: true });

        this.$mapDrops = client.collection('mapdrops');
        this.$mapDrops.ensureIndex({ mapName: 1 }, { unique: true });

        this.$regionDrops = client.collection('regiondrops');
        this.$regionDrops.ensureIndex({ regionName: 1 }, { unique: true });

        this.$mapGroundItems = client.collection('mapgrounditems');
        this.$mapGroundItems.ensureIndex({ mapName: 1 }, { unique: true });

        this.$mapBossTimers = client.collection('mapbosstimers');
        this.$mapBossTimers.ensureIndex({ mapName: 1 }, { unique: true });

        this.$characterLockers = client.collection('characterLockers');
        this.$characterLockers.ensureIndex({ username: 1, charSlot: 1, region: 1, lockerId: 1 }, { unique: true });

        this.$lobbySettings = client.collection('lobbySettings');

        this.$logs = client.collection('logs');
        this.$logs.ensureIndex({ createdAt: 1 }, { expireAfterSeconds: 7200 });

        this.clearStaleData();

        resolve();
      });

    });
  }

  clearStaleData() {
    this.$players.update({}, { $set: { partyName: '' } }, { multi: true });
  }
}

export const DB = new Database();
