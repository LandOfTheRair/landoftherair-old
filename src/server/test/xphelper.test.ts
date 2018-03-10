
import test from 'ava-ts';

import { XPHelper } from '../helpers/character/xp-helper';

test('XP for every level is calculated correctly', async t => {

  t.is(XPHelper.calcLevelXP(1), 1000, 'Level 1');
  t.is(XPHelper.calcLevelXP(2), 2000, 'Level 2');

  t.is(XPHelper.calcLevelXP(18), 131072000, 'Level 18');
  t.is(XPHelper.calcLevelXP(19), 262144000, 'Level 19');
  t.is(XPHelper.calcLevelXP(20), 524288000, 'Level 20');

  // now adds level 20 over and over
  t.is(XPHelper.calcLevelXP(21), 1048576000, 'Level 21');
  t.is(XPHelper.calcLevelXP(22), 1572864000, 'Level 22');
});
