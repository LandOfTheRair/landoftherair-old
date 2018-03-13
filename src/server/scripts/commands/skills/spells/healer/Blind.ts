
import { Skill } from '../../../../../base/Skill';
import { Character, StatName } from '../../../../../../shared/models/character';
import { Blinded as CastEffect } from '../../../../../effects/antibuffs/Blinded';

export class Blind extends Skill {

  static macroMetadata = {
    name: 'Blind',
    macro: 'cast blind',
    icon: 'evil-eyes',
    color: '#900',
    mode: 'clickToTarget',
    tooltipDesc: 'Attempt to blind a single target. Cost: 20 MP'
  };

  public name = ['blind', 'cast blind'];
  public format = 'Target';

  mpCost() { return 20; }
  range(attacker: Character) { return 5; }

  canUse(user: Character, target: Character) {
    if(!super.canUse(user, target) || target.hasEffect('Blinded')) return false;

    const userStat = user.baseClass === 'Healer' ? 'wis' : 'int';

    const baseStat = user.getTotalStat(<StatName>userStat);
    const targetStat = target.getTotalStat('wil');

    return (baseStat - targetStat) + 4 > 0;
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
