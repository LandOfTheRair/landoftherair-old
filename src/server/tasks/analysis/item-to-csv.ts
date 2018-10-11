
import { ItemLoader } from './_itemloader';

import * as _ from 'lodash';

export const drawCsv = async () => {

  const allItems = await ItemLoader.loadAllItems(ItemLoader.ARMOR_TYPES.concat(ItemLoader.WEAPON_TYPES));

  const keys = [
    'name',
    'itemClass',
    'tier',
    'damageClass',
    'stats.str',
    'stats.dex',
    'stats.agi',
    'stats.int',
    'stats.wis',
    'stats.wil',
    'stats.luk',
    'stats.cha',
    'stats.con',
    'stats.move',
    'stats.hpregen',
    'stats.mpregen',
    'stats.hp',
    'stats.mp',
    'stats.weaponDamageRolls',
    'stats.weaponArmorClass',
    'stats.armorClass',
    'stats.accuracy',
    'stats.offense',
    'stats.defense',
    'stats.stealth',
    'stats.perception',
    'stats.physicalDamageBoost',
    'stats.magicalDamageBoost',
    'stats.healingBoost',
    'stats.physicalDamageReflect',
    'stats.magicalDamageReflect',
    'stats.mitigation',
    'stats.magicalResist',
    'stats.physicalResist',
    'stats.necroticResist',
    'stats.energyResist',
    'stats.waterResist',
    'stats.fireResist',
    'stats.iceResist',
    'stats.poisonResist',
    'stats.diseaseResist',
    'trait.name',
    'trait.level',
    'effect.name',
    'effect.potency',
    'requirements.level',
    'requirements.profession',
    'requirements.alignment'
  ];

  const itemArr = [];

  itemArr.push(keys);

  _(allItems)
    .sortBy('itemClass')
    .forEach(item => {
      const itemCsv = [];
      keys.forEach(key => itemCsv.push(_.get(item, key, 0)));

      itemArr.push(itemCsv);
    });

  return itemArr;
};
