
import { Skill } from '../../../../../base/Skill';
import { Character } from '../../../../../../shared/models/character';
import { BarFire as CastEffect } from '../../../../../effects/buffs/BarFire';
import { Player } from '../../../../../../shared/models/player';

export class PowerwordBarFire extends Skill {

  static macroMetadata = {
    name: 'PowerwordBarFire',
    macro: 'powerword barfire',
    icon: 'rosa-shield',
    color: '#DC143C',
    bgColor: '#000',
    mode: 'autoActivate',
    tooltipDesc: 'Shield fire damage for your party. Cost: 30 MP / target'
  };

  public targetsFriendly = true;

  public name = ['powerword barfire'];
  public format = '';

  canUse(user: Character, target: Character) {
    return super.canUse(user, target) && !user.hasEffect('BarFire');
  }

  mpCost(caster: Player, targets: Player[]) { return 30 * targets.length; }
  range(attacker: Character) { return 5; }

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
