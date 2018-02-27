
import test from 'ava-ts';
import { WeaponClasses } from '../../shared/models/item';
import { BaseItemStatsPerTier } from '../helpers/combat-helper';

test('All weapon types have a tier associated with them', async t => {
  WeaponClasses.forEach(itemClass => {
    t.truthy(BaseItemStatsPerTier[itemClass], itemClass);
  });
});
