
import { Skill } from '../../../../../base/Skill';
import { Character, SkillClassNames } from '../../../../../../shared/models/character';
import { Vision as CastEffect } from '../../../../../effects/cures/Vision';

export class Vision extends Skill {

  static macroMetadata = {
    name: 'Vision',
    macro: 'cast vision',
    icon: 'evil-eyes',
    color: '#0a0',
    mode: 'clickToTarget',
    tooltipDesc: 'Cure blindness on a single target. Cost: 10 MP'
  };

  public targetsFriendly = true;

  public name = ['vision', 'cast vision'];
  public format = 'Target';

  mpCost() { return 10; }
  range(attacker: Character) { return 5; }

  canUse(user: Character, target: Character) {
    if(!super.canUse(user, target)) return false;

    const blinded = target.hasEffect('Blind');
    const blurred = target.hasEffect('BlurredVision');

    const skill = user.calcSkillLevel(SkillClassNames.Restoration);

    return (blurred && skill >= blurred.setPotency)
        || (blinded && skill >= blinded.setPotency);
  }

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
