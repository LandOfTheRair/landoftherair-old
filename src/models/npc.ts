
import { omit, flatten, random } from 'lodash';

import { Character, Direction } from './character';
import { Item } from './item';
import * as uuid from 'uuid/v4';

export type Hostility = 'Never' | 'OnHit' | 'Faction' | 'Always';

export class NPC extends Character {
  uuid: string;

  hostility: Hostility = 'OnHit';

  vendorItems: Item[];

  classTrain: string;
  trainSkills: string[] = [];
  maxSkillTrain: number;
  maxLevelUpLevel: number;

  script: string;
  parser: any;
  spawner?: any;
  path?: any[];
  ai?: any;

  bankId: string;
  branchId: string;

  alchOz: number;
  alchCost: number;

  costPerThousand: number;
  repairsUpToCondition: number;

  peddleItem: string;
  peddleCost: number;

  copyDrops: any[];
  drops: Item[];
  giveXp: any;
  repMod: number;

  usableSkills: string[];

  leashMessage: string;
  spawnMessage: string;
  combatMessages: string[];

  init() {
    if(!this.uuid) this.uuid = uuid();
    this.recalculateStats();
  }

  toJSON() {
    return omit(super.toJSON(), ['script', 'parser', 'spawner', 'ai', 'path']);
  }

  receiveMessage(player, message) {
    if(!this.parser) return;

    this.parser.setEnv('player', player);
    const output = this.parser.parse(message);
    if(!output || output === 'undefined') return;

    this.setDirRelativeTo(player);
    player.sendClientMessage({ name: this.name, message: output });
  }

  setDirRelativeTo(char: Character) {
    const diffX = char.x - this.x;
    const diffY = char.y - this.y;

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

  tick() {
    super.tick();

    if(this.ai) {
      this.ai.tick(this);
    }
  }

  isValidStep({ x, y }) {
    if(!this.spawner) return true;
    if(this.spawner.randomWalkRadius > 0 && this.distFrom(this.spawner, { x, y }) > this.spawner.randomWalkRadius) return false;
    return true;
  }

  canDie() {
    return super.canDie() && this.hostility !== 'Never';
  }

  die(killer) {
    super.die(killer);
    if(!this.spawner) return false;

    const giveXp = this.giveXp || { min: 1, max: 10 };

    if(killer) {
      killer.changeRep(this.allegiance, -this.repMod);
      killer.gainExp(random(giveXp.min, giveXp.max));

      this.$$room.calculateLootDrops(this, killer);
    }
  }

  restore() {
    if(this.$$corpseRef) {
      this.$$room.dropCorpseItems(this.$$corpseRef);
      this.$$room.removeItemFromGround(this.$$corpseRef);

      if(this.$$corpseRef.$heldBy) {
        this.$$room.corpseCheck(this.$$room.state.findPlayer(this.$$corpseRef.$heldBy));
      }
    }

    this.spawner.removeNPC(this);
  }

  sendLeashMessage() {
    if(!this.leashMessage) return;
    this.sendClientMessageToRadius(`You hear ${this.leashMessage}.`, 8);
  }

  sendSpawnMessage() {
    if(!this.spawnMessage) return;
    this.sendClientMessageToRadius(`You hear ${this.spawnMessage}.`, 8);
  }
}
