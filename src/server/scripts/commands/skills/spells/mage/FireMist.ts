
import { Skill } from '../../../../../base/Skill';
import { Character } from '../../../../../../shared/models/character';
import { FireMist as CastEffect } from '../../../../../effects/damagers/FireMist';

export class FireMist extends Skill {

  static macroMetadata = {
    name: 'FireMist',
    macro: 'cast firemist',
    icon: 'kaleidoscope-pearls',
    color: '#DC143C',
    mode: 'clickToTarget',
    tooltipDesc: 'Cast an area fire effect on a target (3x3). Allows directional targeting. Cost: 35 MP'
  };

  public name = ['firemist', 'cast firemist'];
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
