

import { Skill } from '../../../../../base/Skill';
import { Character } from '../../../../../../shared/models/character';
import { Attribute } from '../../../../../effects/augments/Attribute';
import { Effect } from '../../../../../base/Effect';
import { Asper } from '../../../../../effects/damagers/Asper';
import { Disease } from '../../../../../effects/dots/Disease';
import { ChannelSummon } from '../../../../../effects/channels/ChannelSummon';

class MistFormEffect extends Effect {

  iconData = {
    name: 'steam',
    color: '#04f',
    tooltipDesc: 'Mist form. Invulnerable and pulsing Asper & Disease.'
  };

  private skillRef: Skill;

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.duration = 10;
    this.skillRef = skillRef;
    target.applyEffect(this);

    const physicalResist = new Attribute({ damageType: 'physical', duration: 10, potency: 0, unableToShred: true });
    physicalResist.cast(caster, caster, skillRef);

    const magicalResist = new Attribute({ damageType: 'magical', duration: 10, potency: 0, unableToShred: true });
    magicalResist.cast(caster, caster, skillRef);

    const batSummon = new ChannelSummon({ numSummons: 3, summonCreature: 'Summoned Vampire Bat' });
    batSummon.cast(caster, caster);
  }

  effectTick(char: Character) {
    char.$$room.state.getAllHostilesInRange(char, 0).forEach(target => {
      const asper = new Asper({ potency: 50 });
      asper.cast(char, target);

      const disease = new Disease({ potency: 50 });
      disease.cast(char, target, this.skillRef);
    });
  }

}

export class VampireMistForm extends Skill {

  name = 'vampiremistform';
  execute() {}

  mpCost(user: Character) { return Math.floor(user.mp.maximum * 0.75); }

  canUse(user: Character, target: Character) {
    return super.canUse(user, target);
  }

  use(user: Character, target: Character) {

    user.sendClientMessageToRadius('You see the vampire condense into a pile of mist!', 5);

    const mistForm = new MistFormEffect({});
    mistForm.cast(user, user, this);
  }

}
