
import { startsWith } from 'lodash';

import { Skill } from '../../../../../base/Skill';
import { Character, SkillClassNames } from '../../../../../../shared/models/character';
import { Darkness as CastEffect } from '../../../../../effects/Darkness';

export class Darkness extends Skill {

  static macroMetadata = {
    name: 'Darkness',
    macro: 'cast darkness',
    icon: 'dust-cloud',
    color: '#000',
    mode: 'clickToTarget',
    tooltipDesc: 'Drop an area darkness effect on the target (3x3). Cost: 25 MP'
  };

  public name = ['darkness', 'cast darkness'];

  flagSkills = [SkillClassNames.Conjuration];

  mpCost = () => 25;
  range = () => 5;

  canUse(user: Character, target: Character) {
    return !target.isInDarkness();
  }

  execute(user: Character, { gameState, args, effect }) {

    const target = this.getTarget(user, args, true);
    if(!target) return;

    if(!this.tryToConsumeMP(user, effect)) return;

    this.use(user, target);
  }

  use(user: Character, target: Character) {
    const effect = new CastEffect({});
    effect.cast(user, target, this);
  }

}
