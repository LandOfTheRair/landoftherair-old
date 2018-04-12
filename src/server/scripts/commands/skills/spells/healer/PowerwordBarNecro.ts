
import { Skill } from '../../../../../base/Skill';
import { Character } from '../../../../../../shared/models/character';
import { BarNecro as CastEffect } from '../../../../../effects/buffs/BarNecro';
import { Player } from '../../../../../../shared/models/player';

export class PowerwordBarNecro extends Skill {

  static macroMetadata = {
    name: 'PowerwordBarNecro',
    macro: 'powerword barnecro',
    icon: 'rosa-shield',
    color: '#1b390e',
    bgColor: '#000',
    mode: 'autoActivate',
    tooltipDesc: 'Shield necrotic damage for your party. Cost: 60 MP / target',
    requireSkillLevel: 13,
    skillTPCost: 10
  };

  public name = ['powerword barnecro'];
  public format = '';

  mpCost(caster: Player, targets: Player[]) { return 30 * targets.length; }
  range(attacker: Character) { return 5; }

  canUse(user: Character, target: Character) {
    return super.canUse(user, target) && !user.hasEffect('BarNecro');
  }

  execute(user: Player, { effect }) {

    if(!user.party) return user.sendClientMessage('You do not have a party!');

    const validTargets = [];
    const members = user.party.members;

    members.forEach(({ name }) => {
      const target = this.getTarget(user, name, true);
      if(!target) return;

      if(!this.isValidBuffTarget(user, target)) return user.sendClientMessage('You cannot target that person with this spell.');

      validTargets.push(target);
    });

    if(!this.tryToConsumeMP(user, effect, validTargets)) return user.sendClientMessage('You cannot seem to concentrate enough.');

    validTargets.forEach(target => {
      this.use(user, target, effect);
    });
  }

  use(user: Character, target: Character, baseEffect = {}) {
    const effect = new CastEffect(baseEffect);
    effect.cast(user, target, this);
  }

}
