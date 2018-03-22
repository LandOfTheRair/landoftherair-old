
import test from 'ava-ts';
import { includes, isNumber } from 'lodash';

import { MaterialSlot, MaterialSlotInfo, MaterialStorageLayout, ReverseValidItems } from '../../shared/helpers/material-storage-layout';

test('Every item declared in material storage is used', async t => {

  Object.keys(MaterialSlot).forEach(itemKey => {

    const val = MaterialSlot[itemKey];
    if(!isNumber(val)) return;

    t.truthy(ReverseValidItems[val], `${itemKey}=${val}; reverse valid items`);
    t.truthy(MaterialSlotInfo[val], `${itemKey}=${val}; material slot info`);

    let wasFound = false;
    MaterialStorageLayout.forEach(({ layout }) => {
      if(wasFound) return;

      wasFound = includes(layout, val);
    });

    t.true(wasFound, `${itemKey}=${val}; used in layout`);
  });

});
