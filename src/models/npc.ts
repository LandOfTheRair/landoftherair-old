
import { omit } from 'lodash';

import { Character } from './character';
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

  init() {
    if(!this.uuid) this.uuid = uuid();
  }

  toJSON() {
    return omit(this, ['script', 'parser', 'agro']);
  }

  distFrom(character: Character) {
    return Math.sqrt(Math.pow(character.x - this.x, 2) + Math.pow(character.y - this.y + 1, 2));
  }

  receiveMessage(room, client, player, message) {
    if(!this.parser) return;

    this.parser.setEnv('player', player);
    const output = this.parser.parse(message);
    if(!output) return;

    room.sendClientLogMessage(client, { name: this.name, message: output });
  }
}
