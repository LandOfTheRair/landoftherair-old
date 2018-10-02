
import { includes, sample } from 'lodash';

import { Player } from '../../../shared/models/player';
import { SkillClassNames } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';
import { CommandExecutor } from '../command-executor';
import { RollerHelper } from '../../../shared/helpers/roller-helper';

export class RunewritingHelper {

  static canRunewrite(player: Player): boolean {
    return player.calcSkillLevel(SkillClassNames.Restoration) >= 1;
  }

  static doRunewrite(player: Player): void {

    const ink = player.potionHand;
    const scroll = player.rightHand;
    const corpse = player.leftHand;

    const npcRef = player.$$room.state.findNPC((<any>corpse).npcUUID);

    const possibleSkills = (npcRef.usableSkills || []).filter(skillName => {
      const skillRef: Skill = CommandExecutor.getSkillRef(skillName);
      if(!skillRef) return false;
      if(skillRef.monsterSkill || !skillRef.requiresLearn || skillRef.unableToLearnFromStealing) return false;

      return true;
    });

    const chosenSkill = sample(possibleSkills);

    if(!chosenSkill) {
      player.sendClientMessage('The corpse blood imparts no knowledge.');
      player.gainSkill(SkillClassNames.Runewriting, Math.floor(npcRef.level / 2));
      player.$$room.dropCorpseItems(corpse);
      player.setLeftHand(null);
      return;
    }

    const failChance = (5 + npcRef.level - player.level) * 5;

    if(failChance > 0 && RollerHelper.XInOneHundred(failChance)) {
      player.sendClientMessage('The corpse blood is too difficult to inscribe.');
      player.gainSkill(SkillClassNames.Runewriting, Math.floor(npcRef.level / 3));
      player.$$room.dropCorpseItems(corpse);
      player.setLeftHand(null);
      return;
    }

    let skillGain = npcRef.level + 10;
    if(includes(npcRef.name, 'elite')) skillGain *= 2;
    player.gainSkill(SkillClassNames.Runewriting, skillGain);

    ink.ounces--;
    if(ink.ounces <= 0) player.setPotionHand(null);

    scroll.name = `Runewritten Scroll - ${chosenSkill} Lv. ${npcRef.level}`;
    scroll.desc = `a rune scroll inscribed with the spell "${chosenSkill}"`;
    scroll.effect = {
      name: chosenSkill,
      potency: npcRef.level,
      uses: player.calcSkillLevel(SkillClassNames.Runewriting) + 1
    };

    scroll.cosmetic = { name: 'Ancientify', isPermanent: true };

    player.$$room.dropCorpseItems(corpse);
    player.setLeftHand(null);

    player.sendClientMessage(`The corpse imparts the knowledge of the spell "${chosenSkill}"!`);
  }
}
