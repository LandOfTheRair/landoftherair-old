
import { ItemLoader } from './_itemloader';

import * as _ from 'lodash';

ItemLoader.loadAllItems(
  ItemLoader.WEAPON_TYPES
    .concat(ItemLoader.ARMOR_TYPES)
    .concat(ItemLoader.OTHER_TYPES)
).then(items => {
  const sprites = _(items)
    .map('sprite')
    .uniq()
    .sortBy()
    .value();

  const sortedSprites = [];

  const numRows = Math.floor(sprites[sprites.length - 1] / 32);

  for(let i = 0; i <= numRows; i++) {
    sortedSprites[i] = [];
  }

  for(let i = 0; i < sprites.length; i++) {
    sortedSprites[Math.floor(sprites[i] / 32)].push(sprites[i]);
  }

  require('fs').writeFileSync('allsprites.json', JSON.stringify(sortedSprites, null, 4));

  process.exit(0);
});
