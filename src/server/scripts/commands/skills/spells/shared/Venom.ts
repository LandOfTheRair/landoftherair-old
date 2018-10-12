
import { Skill } from '../../../../../base/Skill';
import { Character } from '../../../../../../shared/models/character';
import { Venom as CastEffect } from '../../../../../effects/dots/Venom';

export class Venom extends Skill {

  static macroMetadata = {
    name: 'Venom',
    macro: 'cast venom',
    icon: 'dripping-goo',
    color: '#0a0',
    mode: 'clickToTarget',
    tooltipDesc: 'Inflict a deadly venom on your target. Cost: 30 MP'
  };

  public name = ['venom', 'cast venom'];
  public format = 'Target';

  mpCost() { return 30; }
  range(attacker: Character) { return 5; }

  canUse(user: Character, target: Character) {
    return super.canUse(user, target) && !target.hasEffect('Venom');
  }

  execute(user: Character, { args, effect }) {

    const target = this.getTarget(user, args);
    if(!target) return;

    if(target === user) return;

    if(!this.tryToConsumeMP(user, effect)) return;

    this.use(user, target, effect);
  }

  use(user: Character, target: Character, baseEffect = {}) {
    const effect = new CastEffect(baseEffect);
    effect.cast(user, target, this);
  }

}
