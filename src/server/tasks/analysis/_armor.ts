
import { ItemLoader } from './_itemloader';

import * as _ from 'lodash';

import * as CLITable from 'cli-table';

export const drawNormal = async () => {

  const table = new CLITable({
    head: ['Item Class', '# Items', '# Binds', 'Avg. Offense', 'Avg. Defense', 'Avg. AC'],
    colWidths: [15, 10, 10, 15, 15, 9]
  });

  const allItems = await ItemLoader.loadAllItems(ItemLoader.ARMOR_TYPES);

  _(allItems)
    .sortBy('itemClass')
    .groupBy('itemClass')
    .forEach((data, itemClass) => {

      const arr = [itemClass, data.length];

      arr.push((_.sumBy(data, (item) => item.binds ? 1 : 0) / data.length).toFixed(2));

      ['offense', 'defense', 'armorClass'].forEach(stat => {
        const avg = (_.sumBy(data, (item) => _.get(item, `stats.${stat}`, 0)) / data.length).toFixed(2);
        arr.push(avg);
      });

      table.push(arr);
    });

  return table.toString();
};
