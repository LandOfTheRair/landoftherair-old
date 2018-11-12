


import { Skill } from '../../../../../base/Skill';
import { Character} from '../../../../../../shared/models/character';
import { FleetOfFoot as CastEffect } from '../../../../../effects/';

export class FleetOfFoot extends Skill {

  static macroMetadata = {
    name: 'FleetOfFoot',
    macro: 'cast fleetoffoot',
    icon: 'wing-foot',
    color: '#0aa',
    mode: 'clickToTarget',
    tooltipDesc: 'Take less damage from falls and be immune to prone. Cost: 25 MP'
  };

  public name = ['fleetoffoot', 'cast fleetoffoot'];

  mpCost() { return 25; }
  range(attacker: Character) { return 5; }

  canUse(user: Character, target: Character) {
    return super.canUse(user, target) && !target.hasEffect('FleetOfFoot');
  }

  execute(user: Character, { args, effect }) {

    const target = this.getTarget(user, args, true);
    if(!target) return;

    if(target === user) return;

    if(!this.tryToConsumeMP(user, effect)) return;

    this.use(user, target);
  }

  use(user: Character, target: Character, baseEffect = {}) {
    const effect = new CastEffect(baseEffect);
    effect.cast(user, target, this);
  }

}
