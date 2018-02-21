
import { SpellEffect } from '../../base/Effect';
import { Character, SkillClassNames } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';
import { Player } from '../../../shared/models/player';

export class Succor extends SpellEffect {

  maxSkillForSkillGain = 7;
  skillFlag = (caster) => SkillClassNames.Restoration;

  async cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);

    if(caster.$$room.state.isSuccorRestricted(<Player>caster)) {
      return caster.sendClientMessage('You can\'t seem to find anything recognizable about this place.');
    }

    if(caster.rightHand) return caster.sendClientMessage('You must empty your right hand!');

    const skill = caster.calcSkillLevel(SkillClassNames.Restoration);

    caster.sendClientMessage('You channel your memories of this place into a ball of magical energy.');

    const succor = await caster.$$room.itemCreator.getItemByName('Succor Blob');

    const succorRegion = caster.$$room.state.getSuccorRegion(<Player>caster);

    succor.setOwner(caster);
    succor.desc = `a blob of spatial memories formed in the lands of ${caster.map} around ${succorRegion}`;
    succor.ounces = Math.floor(skill / 5) || 1;

    succor.succorInfo = {
      map: caster.map,
      x: caster.x,
      y: caster.y,
      z: (<any>caster).z || 0
    };

    caster.setRightHand(succor);
  }
}
