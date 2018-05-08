
import { Skill } from '../../../../../base/Skill';
import { Character } from '../../../../../../shared/models/character';
import { Darkness as CastEffect } from '../../../../../effects/misc/Darkness';
import { CharacterHelper } from '../../../../../helpers/character/character-helper';

export class Darkness extends Skill {

  static macroMetadata = {
    name: 'Darkness',
    macro: 'cast darkness',
    icon: 'dust-cloud',
    color: '#000',
    mode: 'clickToTarget',
    tooltipDesc: 'Drop an area darkness effect on the target (3x3). Allows directional targeting. Cost: 25 MP'
  };

  public name = ['darkness', 'cast darkness'];

  mpCost() { return 25; }
  range(attacker: Character) { return 5; }

  canUse(user: Character, target: Character) {
    return super.canUse(user, target) && !CharacterHelper.isInDarkness(target);
  }

  execute(user: Character, { args, effect }) {

    const target = this.getTarget(user, args, true, true);
    if(!target) return;

    if(!this.tryToConsumeMP(user, effect)) return;

    this.use(user, target, effect);
  }

  use(user: Character, target: Character|{ x: number, y: number }, baseEffect = {}) {
    const effect = new CastEffect(baseEffect);
    effect.cast(user, target, this);
  }

}
