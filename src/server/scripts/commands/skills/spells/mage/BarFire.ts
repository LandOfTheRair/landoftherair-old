
import { startsWith } from 'lodash';

import { Skill } from '../../../../../base/Skill';
import { Character, SkillClassNames } from '../../../../../../models/character';
import { BarFire as CastEffect } from '../../../../../effects/BarFire';

export class BarFire extends Skill {

  public name = 'barfire';
  public format = 'Target';

  static macroMetadata = {
    name: 'BarFire',
    macro: 'barfire',
    icon: 'rosa-shield',
    color: '#DC143C',
    mode: 'clickToTarget'
  };

  flagSkills = [SkillClassNames.Conjuration];

  mpCost = () => 20;
  range = () => 5;

  execute(user: Character, { gameState, args, effect }) {

    const target = this.getTarget(user, args, true);
    if(!target) return;

    if(!this.tryToConsumeMP(user, effect)) return;

    this.use(user, target, effect);
  }

  use(user: Character, target: Character, baseEffect = {}) {
    const effect = new CastEffect(baseEffect);
    effect.cast(user, target, this);
  }

}
