


import { Skill } from '../../../../../base/Skill';
import { Character, SkillClassNames } from '../../../../../../shared/models/character';
import { CombatHelper } from '../../../../../helpers/world/combat-helper';
import { MessageHelper } from '../../../../../helpers/world/message-helper';
import { Player } from '../../../../../../shared/models/player';
import { LoweredDefenses } from '../../../../../effects/antibuffs/LoweredDefenses';

export class Rapidpunch extends Skill {

  static macroMetadata = {
    name: 'Rapidpunch',
    macro: 'art rapidpunch',
    icon: 'fire-punch',
    color: '#a00',
    mode: 'lockActivation',
    tooltipDesc: 'Punch a single target many times in succession.',
    requireSkillLevel: 15,
    skillTPCost: 10
  };

  public name = ['rapidpunch', 'art rapidpunch'];
  public format = 'Target';
  public unableToLearnFromStealing = true;

  execute(user: Player, { args }) {
    if(!args) return false;

    const weapon = user.rightHand;
    if(weapon) return user.sendClientMessage('You need an open hand to rapidpunch!');

    const possTargets = MessageHelper.getPossibleMessageTargets(user, args);
    const target = possTargets[0];
    if(!target) return user.youDontSeeThatPerson(args);

    if(target === user) return;

    this.use(user, target);
  }

  use(user: Character, target: Character) {

    const totalAccuracy = user.getTotalStat('accuracy');
    const accuracyPenaltyPerHit = Math.floor(totalAccuracy / 16);

    for(let i = 0; i < 8; i++) {
      /** PERK:CLASS:WARRIOR:Warriors gain skill on physical hits. */
      if(user.baseClass === 'Warrior') user.gainSkill(user.rightHand ? user.rightHand.itemClass : SkillClassNames.Martial, 1);

      CombatHelper.physicalAttack(user, target, { damageMult: 0.65, isPunch: true, accuracyLoss: i * accuracyPenaltyPerHit });
    }

    const debuff = new LoweredDefenses({ potency: 5 });
    debuff.cast(user, user);
  }

}
