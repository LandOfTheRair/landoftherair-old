
import { Skill } from '../../../../../base/Skill';
import { Character } from '../../../../../../shared/models/character';
import { EnergyWave as CastEffect } from '../../../../../effects/damagers/EnergyWave';

export class EnergyWave extends Skill {

  static macroMetadata = {
    name: 'EnergyWave',
    macro: 'cast energywave',
    icon: 'beams-aura',
    color: '#000080',
    mode: 'autoActivate',
    tooltipDesc: 'Cast an area energy effect from your location (5x5). Cost: 45 MP',
    requireCharacterLevel: 10,
    requireSkillLevel: 7
  };

  public name = ['energywave', 'cast energywave'];
  public format = '';

  mpCost() { return 45; }
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
