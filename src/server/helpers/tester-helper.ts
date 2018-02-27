
import { Player } from '../../shared/models/player';
import { SkillClassNames } from '../../shared/models/character';
import { SkillHelper } from './skill-helper';

import { extend } from 'lodash';

const level1 = {
  Head: 'Antanian Helm',
  Neck: 'Antanian Amulet',
  Waist: 'Antanian Sash',
  Bracers: 'Antanian Bracers',
  Ring1: 'Antanian Ring',
  Ring2: 'Antanian Ring',
  Hands: 'Antanian Leather Gloves',
  Feet: 'Antanian Leather Boots',
  Armor: 'Antanian Tunic',
  Robe1: 'Antanian Cloak',
  Robe2: 'Antanian Cloak'
};

const Loadouts = {
  Mage: {
    1: extend({}, level1, { Belt: ['Antanian Staff', 'Antanian Shortsword'] })
  },
  Thief: {
    1: extend({}, level1, { Belt: ['Antanian Dagger', 'Antanian Shortsword'] })
  },
  Warrior: {
    1: extend({}, level1, { Belt: ['Antanian Longsword', 'Antanian Mace', 'Antanian Greatsword', 'Antanian Shortbow', 'Antanian Wooden Shield'] })
  },
  Healer: {
    1: extend({}, level1, { Belt: ['Antanian Mace', 'Antanian Shield'] })
  }
};

export class TesterHelper {

  static sendMessage(player: Player, message: string) {
    player.sendClientMessage(`[tester] ${message}`);
  }

  static generateLoadout(player: Player, level: number) {
    let curCheckLevel = level;

    let curGear = Loadouts[player.baseClass][curCheckLevel];
    while(!curGear) {
      curCheckLevel -= 1;
      curGear = Loadouts[player.baseClass][curCheckLevel];
    }

    ['Ear', 'Head', 'Neck',
     'Wrists', 'Waist', 'Ring1', 'Ring2',
      'Hands', 'Feet', 'Armor', 'Robe1', 'Robe2'
    ].forEach(async slot => {
      if(!curGear[slot]) return;

      const item = await player.$$room.itemCreator.getItemByName(curGear[slot]);
      player._equip(item);
    });

    if(curGear.Belt && curGear.Belt.length > 0) {
      player.belt.takeItemFromSlots([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
      curGear.Belt.forEach(async itemName => {
        const item = await player.$$room.itemCreator.getItemByName(itemName);
        player.belt.addItem(item);
      });
    }

    this.sendMessage(player, `Generated ${player.baseClass} loadout for level ${level}`);
  }

  static setLevel(player: Player, level: number) {
    player.level = level;
    this.sendMessage(player, `Set level to: ${level}`);
  }

  static gainGold(player: Player, gold: number) {
    player.gainGold(gold);
    this.sendMessage(player, `Gained ${gold} gold`);
  }

  static setSkills(player: Player, level: number) {
    const curSkill = player.allSkills;
    const skillGain = SkillHelper.calcSkillXP(level - 1);

    Object.keys(SkillClassNames).forEach(skill => {
      player._gainSkill(skill, -curSkill[skill.toLowerCase()]);

      player.gainSkill(skill, skillGain);
    });

    this.sendMessage(player, `Set all skill levels to: ${level}`);
  }

  static resetTraits(player: Player) {
    player.loseTraitPoints(9999);
    player.gainTraitPoints(1000);
    player.losePartyPoints(9999);
    player.gainPartyPoints(1000);

    const allTraits = player.allTraitLevels;
    Object.keys(allTraits).forEach(key => {
      player.decreaseTraitLevel(key, 50);
    });

    this.sendMessage(player, `Reset all traits and gained 1000 TP/PP`);
  }

}
