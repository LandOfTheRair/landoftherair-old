
import { clamp, includes, sample } from 'lodash';

import { Player } from '../../../shared/models/player';
import { RollerHelper } from '../../../shared/helpers/roller-helper';
import { SkillClassNames } from '../../../shared/interfaces/character';
import { Skill } from '../../base/Skill';
import { CommandExecutor } from '../command-executor';

export class SurvivalHelper {

  static tan(player: Player) {

    player.rightHand.loseCondition(100, () => player.recalculateStats());

    let didTan = false;

    const ground = player.$$room.state.getGroundItems(player.x, player.y);
    ground.Corpse.forEach(corpse => {
      if(didTan) return;

      if(corpse.$$isPlayerCorpse) {
        player.sendClientMessage(`You cannot tan players, you monster!`);
        return;
      }

      if(!includes(corpse.$$playersHeardDeath, player.username)) {
        player.sendClientMessage(`You didn't have a hand in killing the ${corpse.desc.split('the corpse of a ')[1]}!`);
        return;
      }

      if(!corpse.tansFor) {
        player.sendClientMessage(`You can't make anything out of ${corpse.desc}!`);
        return;
      }

      didTan = true;

      const corpseNPC = player.$$room.state.findNPC(corpse.npcUUID);
      if(corpseNPC) corpseNPC.restore();
      else          player.$$room.removeItemFromGround(corpse);

      const curSkill = player.calcBaseSkillLevel(SkillClassNames.Survival);
      const maxSkill = player.$$room.maxSkill;

      const isBetterThanCorpseSkillRequired = (<any>corpse).tanSkillRequired && curSkill >= (<any>corpse).tanSkillRequired;
      const diff = maxSkill - curSkill;

      // 5 skills below or worse - 0% chance to tan. 5 skills above or better - 100% chance to tan
      const pctChance = Math.abs(clamp(diff, -5, 5) - 5) * 10;

      if(isBetterThanCorpseSkillRequired || RollerHelper.XInOneHundred(pctChance)) {
        player.$$room.npcLoader.loadItem(corpse.tansFor)
          .then(item => {
            item.setOwner(player);
            player.$$room.addItemToGround(player, item);
          });

        player.sendClientMessage(`You successfully tanned ${corpse.desc}!`);
        player.gainSkill(SkillClassNames.Survival, (<any>corpse).tanSkillRequired);

      } else {
        player.sendClientMessage(`You failed to tan ${corpse.desc}.`);
        player.gainSkill(SkillClassNames.Survival, 3);
      }
    });
  }

  static extract(player: Player) {

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
      if(skillName && skillName.result) skillName = skillName.result;

      const skillRef: Skill = CommandExecutor.getSkillRef(skillName);
      if(!skillRef) return false;
      if(skillRef.monsterSkill || !skillRef.requiresLearn || skillRef.unableToLearnFromStealing) return false;

      return true;
    });

    let chosenSkill = sample(possibleSkills);
    if(chosenSkill && chosenSkill.result) chosenSkill = chosenSkill.result;

    if(!chosenSkill) {
      player.sendClientMessage('The corpse blood had no magical energy.');
      player.$$room.dropCorpseItems(corpse);
      corpse.$heldBy = null;
      npcRef.restore(true);
      player.setLeftHand(null);
      return;
    }

    const failChance = (5 + npcRef.level - player.level) * 5;

    if(failChance > 0 && RollerHelper.XInOneHundred(failChance)) {
      player.gainSkill(SkillClassNames.Survival, Math.floor(npcRef.level / 3));
      player.sendClientMessage('The corpse blood is too difficult to extract.');
      player.$$room.dropCorpseItems(corpse);
      corpse.$heldBy = null;
      npcRef.restore(true);
      player.setLeftHand(null);
      return;
    }

    let skillGain = npcRef.level + 10;
    if(includes(npcRef.name, 'elite')) skillGain *= 2;
    player.gainSkill(SkillClassNames.Survival, skillGain);

    player.sendClientMessage(`The corpse blood imparts the knowledge of the spell "${chosenSkill}"!`);

    player.$$room.dropCorpseItems(corpse);
    player.setLeftHand(null);
    corpse.$heldBy = null;
    npcRef.restore(true);

    player.$$room.npcLoader.loadItem('Vial of Blood')
      .then(item => {
        player.setRightHand(item);
        item.name = `Vial of Blood - ${chosenSkill} Lv. ${npcRef.level}`;
        item.desc = `a vial of blood whose runes spell "${chosenSkill}"`;

        item.ounces = Math.max(1, player.calcSkillLevel(SkillClassNames.Survival) + 1 + sample([-1, 0, 1]));

        item.effect = { name: 'Runeblood', potency: 1 };

        item.stats.effect = {
          name: chosenSkill,
          potency: npcRef.level
        };
      });
  }

  static repair(player: Player) {

    const target = player.leftHand;
    const hammer = player.rightHand;

    const baseCondition = target.condition;

    // do repair
    let earnedCondition = 10000;
    if(hammer.name === 'Smith Hammer') earnedCondition += 5000;
    earnedCondition += player.calcSkillLevel(SkillClassNames.Survival) * 1000;

    if(target.condition >= earnedCondition) {
      player.sendClientMessage('That item is currently above your skills.');
      return;
    }

    hammer.loseCondition(500, () => player.recalculateStats());

    target.condition = earnedCondition;

    player.sendClientMessage(`Your ${target.itemClass.toLowerCase()} is now in ${target.conditionString()} condition.`);
    player.recalculateStats();

    // gain skill
    let skillGained = 0;
    if(baseCondition < 10000) skillGained += 2;
    if(baseCondition < 5000)  skillGained += 3;
    if(baseCondition === 0)   skillGained += 5;

    player.gainSkill(SkillClassNames.Survival, skillGained);
  }
}
