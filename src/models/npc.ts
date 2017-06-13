
import { omit, flatten } from 'lodash';

import { Character, Direction } from './character';
import { Item } from './item';
import * as uuid from 'uuid/v4';

export type Hostility = 'Never' | 'OnHit' | 'OppositeAlignment' | 'Faction' | 'Always';

export class NPC extends Character {
  uuid: string;

  sprite: number;
  hostility: Hostility = 'OnHit';
  agro: any = {};
  vendorItems: Item[];

  script: string;
  parser: any;
  spawner?: any;
  path?: any[];
  ai?: any;

  init() {
    if(!this.uuid) this.uuid = uuid();
  }

  toJSON() {
    return omit(this, ['script', 'parser', 'spawner', 'ai', 'path']);
  }

  distFrom(character: Character) {
    return Math.sqrt(Math.pow(character.x - this.x, 2) + Math.pow(character.y - this.y + 1, 2));
  }

  receiveMessage(room, client, player, message) {
    if(!this.parser) return;

    this.parser.setEnv('player', player);
    const output = this.parser.parse(message);
    if(!output) return;

    this.setDirRelativeTo(player);
    room.sendClientLogMessage(client, { name: this.name, message: output });
  }

  setDirRelativeTo(char: Character) {
    const diffX = char.x - this.x;
    const diffY = char.y - this.y + 1;

    this.setDirBasedOnXYDiff(diffX, diffY);
  }

  setPath(path: string) {
    if(!path) return;
    this.path = flatten(path.split(' ').map(str => {
      const [numSteps, dir] = str.split('-');
      const coord = this.getXYFromDir(<Direction>dir);
      const ret = [];
      for(let i = 0; i < +numSteps; i++) {
        ret.push(coord);
      }
      return ret;
    }));
  }

  takeStep({ x, y }) {
    this.x += x;
    this.y += y;
  }

  tick() {
    super.tick();

    if(this.ai) {
      this.ai.tick(this);
    }
  }
}
