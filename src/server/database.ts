
import { MongoClient } from 'mongodb';
import { Logger } from './logger';

const DB_URI = process.env.MONGODB_URI;
if(!DB_URI) {
  Logger.error('No env.MONGODB_URI set. Set one.');
  process.exit(0);
}

class Database {

  public $accounts: any;
  public $players: any;
  public $items: any;
  public $recipes: any;
  public $npcs: any;
  public $mapDrops: any;
  public $regionDrops: any;
  public $mapGroundItems: any;
  public $characterLockers: any;
  public $mapBossTimers: any;
  public $lobbySettings: any;
  public $logs: any;
  public $gameSettings: any;

  private client: MongoClient;

  async init() {
    try {
      this.client = await MongoClient.connect(DB_URI);
    } catch(err) {
      console.error(err);
      process.exit(0);
    }

    this.$accounts = this.client.collection('accounts');
    this.$accounts.ensureIndex({ userId: 1 });
    this.$accounts.ensureIndex({ username: 1 }, { unique: true });

    this.$players = this.client.collection('players');
    this.$players.ensureIndex({ username: 1, charSlot: 1 });
    this.$players.ensureIndex({ username: 1, map: 1, charSlot: 1 });

    this.$items = this.client.collection('items');
    this.$items.ensureIndex({ name: 1 }, { unique: true });

    this.$recipes = this.client.collection('recipes');

    this.$npcs = this.client.collection('npcs');
    this.$npcs.ensureIndex({ npcId: 1 }, { unique: true });

    this.$mapDrops = this.client.collection('mapdrops');
    this.$mapDrops.ensureIndex({ mapName: 1 }, { unique: true });

    this.$regionDrops = this.client.collection('regiondrops');
    this.$regionDrops.ensureIndex({ regionName: 1 }, { unique: true });

    this.$mapGroundItems = this.client.collection('mapgrounditems');
    this.$mapGroundItems.ensureIndex({ mapName: 1 }, { unique: true });

    this.$mapBossTimers = this.client.collection('mapbosstimers');
    this.$mapBossTimers.ensureIndex({ mapName: 1 }, { unique: true });

    this.$characterLockers = this.client.collection('characterLockers');
    this.$characterLockers.ensureIndex({ username: 1, charSlot: 1, region: 1, lockerId: 1 }, { unique: true });

    this.$lobbySettings = this.client.collection('lobbySettings');

    this.$logs = this.client.collection('logs');
    this.$logs.ensureIndex({ createdAt: 1 }, { expireAfterSeconds: 3600 * 6 });

    this.$gameSettings = this.client.collection('gamesettings');

    this.clearStaleData();
  }

  clearStaleData() {
    this.$players.update({}, { $set: { partyName: '' } }, { multi: true });
  }
}

export const DB = new Database();
