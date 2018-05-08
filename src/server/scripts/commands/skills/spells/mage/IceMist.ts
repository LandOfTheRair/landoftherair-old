
import { Skill } from '../../../../../base/Skill';
import { Character } from '../../../../../../shared/models/character';
import { IceMist as CastEffect } from '../../../../../effects/damagers/IceMist';

export class IceMist extends Skill {

  static macroMetadata = {
    name: 'IceMist',
    macro: 'cast icemist',
    icon: 'kaleidoscope-pearls',
    color: '#000080',
    mode: 'clickToTarget',
    tooltipDesc: 'Cast an area ice effect on a target (3x3). Allows directional targeting. Cost: 35 MP'
  };

  public name = ['icemist', 'cast icemist'];
  public format = 'Target';

  mpCost() { return 35; }
  range(attacker: Character) { return 5; }

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
