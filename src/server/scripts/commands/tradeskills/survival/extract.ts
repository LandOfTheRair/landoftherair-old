
import { includes, sample } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';
import { SkillClassNames } from '../../../../../shared/models/character';
import { RollerHelper } from '../../../../../shared/helpers/roller-helper';
import { CommandExecutor } from '../../../../helpers/command-executor';
import { Skill } from '../../../../base/Skill';

export class Extract extends Command {

  public name = 'extract';
  public format = '';

  async execute(player: Player) {

    if(player.rightHand) return player.sendClientMessage('You must have an empty hand to extract blood!');
    if(!player.leftHand || player.leftHand.itemClass !== 'Corpse') return player.sendClientMessage('You are not holding a corpse!');

    const corpse = player.leftHand;

    if(corpse.$$isPlayerCorpse) {
      player.sendClientMessage(`You cannot tan players, you monster!`);
      return;
    }

    if(!includes(corpse.$$playersHeardDeath, player.username)) {
      player.sendClientMessage(`You didn't have a hand in killing the ${corpse.desc.split('the corpse of a ')[1]}!`);
      return;
    }

    const npcRef = player.$$room.state.findNPC((<any>corpse).npcUUID);

    if(!npcRef) return player.sendClientMessage('The corpse blood is no longer extractable');

    const possibleSkills = (npcRef.usableSkills || []).filter(skillName => {
      const skillRef: Skill = CommandExecutor.getSkillRef(skillName);
      if(!skillRef) return false;
      if(skillRef.monsterSkill || !skillRef.requiresLearn || skillRef.unableToLearnFromStealing) return false;

      return true;
    });

    const chosenSkill = sample(possibleSkills);

    if(!chosenSkill) {
      player.gainSkill(SkillClassNames.Survival, Math.floor(npcRef.level / 2));
      player.sendClientMessage('The corpse blood had no magical energy left.');
      player.$$room.dropCorpseItems(corpse);
      player.setLeftHand(null);
      return;
    }

    const failChance = (5 + npcRef.level - player.level) * 5;

    if(failChance > 0 && RollerHelper.XInOneHundred(failChance)) {
      player.gainSkill(SkillClassNames.Survival, Math.floor(npcRef.level / 3));
      player.sendClientMessage('The corpse blood is too difficult to extract.');
      player.$$room.dropCorpseItems(corpse);
      player.setLeftHand(null);
      return;
    }

    let skillGain = npcRef.level + 10;
    if(includes(npcRef.name, 'elite')) skillGain *= 2;
    player.gainSkill(SkillClassNames.Runewriting, skillGain);

    player.sendClientMessage(`The corpse blood imparts the knowledge of the spell "${chosenSkill}"!`);

    player.$$room.dropCorpseItems(corpse);
    player.setLeftHand(null);

    player.$$room.npcLoader.loadItem('Vial of Blood')
      .then(item => {
        player.setRightHand(item);
        item.name = `Vial of Blood - ${chosenSkill} Lv. ${npcRef.level}`;
        item.desc = `a vial of blood whose runes spell "${chosenSkill}"`;

        item.ounces = player.calcSkillLevel(SkillClassNames.Survival) + 1;

        item.effect = {
          name: chosenSkill,
          potency: npcRef.level
        };
      });

  }

}
