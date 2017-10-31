
import { ItemLoader } from './_itemloader';

import * as _ from 'lodash';

import * as CLITable from 'cli-table';

export const drawNormal = async () => {

  const table = new CLITable({
    head: ['Item Class', '# Items', 'Avg. BaseDmg', 'Avg. MinDmg', 'Avg. MaxDmg', 'Avg. # Rolls'],
    colWidths: [15, 10, 14, 13, 13, 14]
  });

  const allItems = await ItemLoader.loadAllItems(ItemLoader.WEAPON_TYPES);

  _(allItems)
    .sortBy('itemClass')
    .groupBy('itemClass')
    .forEach((data, itemClass) => {
      const baseDamage =  (_.sumBy(data, 'baseDamage') / data.length).toFixed(2);
      const minDamage =   (_.sumBy(data, 'minDamage') / data.length).toFixed(2);
      const maxDamage =   (_.sumBy(data, 'maxDamage') / data.length).toFixed(2);
      const damageRolls = (_.sumBy(data, 'damageRolls') / data.length).toFixed(2);

      table.push([itemClass, data.length, baseDamage, minDamage, maxDamage, damageRolls]);
    });

  return table.toString();
};

export const drawSpecial = async () => {

  const table = new CLITable({
    head: ['Item Class', '# Items', 'Avg. Offense', 'Avg. Defense', 'Avg. Accuracy', 'Avg. AC'],
    colWidths: [15, 10, 15, 15, 15, 9]
  });

  const allItems = await ItemLoader.loadAllItems(ItemLoader.WEAPON_TYPES);

  _(allItems)
    .sortBy('itemClass')
    .groupBy('itemClass')
    .forEach((data, itemClass) => {

      const arr = [itemClass, data.length];

      ['offense', 'defense', 'accuracy', 'armorClass'].forEach(stat => {
        const avg = (_.sumBy(data, (item) => _.get(item, `stats.${stat}`, 0)) / data.length).toFixed(2);
        arr.push(avg);
      });

      table.push(arr);
    });

  return table.toString();
};
