
import { ItemLoader } from './_itemloader';

import * as _ from 'lodash';

import { ArmorClasses, HeadClasses, RobeClasses, ShieldClasses } from '../../../shared/interfaces/item';

export const writeProgression = async () => {
  const allItems = await ItemLoader.loadAllItems(ItemLoader.ARMOR_TYPES.concat(ItemLoader.WEAPON_TYPES));

  const itemGroups = _.groupBy(allItems, i => {
    if(_.includes(ShieldClasses, i.itemClass)) return 'Shield';
    if(i.type !== 'Martial') return i.type;
    if(_.includes(ArmorClasses, i.itemClass)) return 'Armor';
    if(_.includes(HeadClasses, i.itemClass)) return 'Head';
    if(_.includes(RobeClasses, i.itemClass)) return 'Robe';
    return i.itemClass;
  });

  _.sortBy(Object.keys(itemGroups)).forEach(itemType => {
    console.log(`${itemType} Progression`);
    console.log();

    const sortedItems = _.sortBy(itemGroups[itemType], item => {
      return _.get(item, 'requirements.level', 1);
    });

    sortedItems.forEach(item => {
      console.log(`Level ${_.get(item, 'requirements.level', 1)}: ${item.name}`);
    })

    console.log();
  });

  process.exit(0);
}

writeProgression();