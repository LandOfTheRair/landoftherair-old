
import test from 'ava-ts';

import { SkillHelper } from '../helpers/character/skill-helper';

test('Skill for every level is calculated correctly', async t => {

  t.is(SkillHelper.calcSkillXP(1), 155, 'Level 1');
  t.is(SkillHelper.calcSkillXP(2), 240, 'Level 2');
  t.is(SkillHelper.calcSkillXP(3), 372, 'Level 3');

  t.is(SkillHelper.calcSkillXP(14), 46200, 'Level 14');

  t.is(SkillHelper.calcSkillXP(19), 413335, 'Level 19');
});
