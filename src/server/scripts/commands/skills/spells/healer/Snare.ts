
import { Skill } from '../../../../../base/Skill';
import { Character } from '../../../../../../shared/models/character';
import { Snare as CastEffect } from '../../../../../effects/antibuffs/Snare';

export class Snare extends Skill {

  static macroMetadata = {
    name: 'Snare',
    macro: 'cast snare',
    icon: 'light-thorny-triskelion',
    color: '#0a0',
    mode: 'clickToTarget',
    tooltipDesc: 'Slow down the target. Cost: 50 MP'
  };

  public name = ['snare', 'cast snare'];
  public format = 'Target';

  canUse(user: Character, target: Character) {
    return super.canUse(user, target) && !target.hasEffect('Snare');
  }

  mpCost() { return 50; }
  range(attacker: Character) { return 5; }

  execute(user: Character, { args, effect }) {

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
