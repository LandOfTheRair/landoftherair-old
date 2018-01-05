
import { startsWith } from 'lodash';

import { Skill } from '../../../../../base/Skill';
import { Character, SkillClassNames } from '../../../../../../shared/models/character';
import { BarFrost as CastEffect } from '../../../../../effects/BarFrost';

export class BarFrost extends Skill {

  static macroMetadata = {
    name: 'BarFrost',
    macro: 'cast barfrost',
    icon: 'rosa-shield',
    color: '#000080',
    mode: 'clickToTarget',
    tooltipDesc: 'Shield frost damage for a single target. Cost: 20 MP'
  };

  public name = ['barfrost', 'cast barfrost'];
  public format = 'Target';

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
