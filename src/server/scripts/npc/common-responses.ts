
import { NPC } from '../../../models/npc';
import { includes, capitalize } from 'lodash';

export const VendorResponses = (npc: NPC) => {
  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { client, player }) => {
      if(npc.distFrom(player) > 2) return 'Please move closer.';
      npc.$room.showShopWindow(client, npc);
      return `Greetings ${player.name}! Please view my wares.`;
    });

  npc.parser.addCommand('appraise')
    .set('syntax', ['appraise'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 2) return 'Please move closer.';

      if(!player.rightHand) return 'I cannot give you as value for your hand.';

      const value = player.rightHand.value;
      if(value === 0) return 'That item is worthless.';

      return `That item is worth about ${value.toLocaleString()} coins, but I'd only buy it for ${player.sellValue(player.rightHand).toLocaleString()} coins.`;
    });
};

export const BaseClassTrainerResponses = (npc: NPC) => {

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player, client }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';
      npc.$room.showTrainerWindow(client, npc);
      return `Hail, ${player.name}! If you want to try to level up, TRAIN with me. Alternatively, I can let you know how your combat skills are progressing if you want to ASSESS them! You can also JOIN the ${npc.classTrain} profession if you haven't chosen one already!`;
    });

  npc.parser.addCommand('assess')
    .set('syntax', ['assess <string:skill*>'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';

      const skill = args['skill*'].toLowerCase();

      if(!includes(npc.trainSkills, capitalize(skill))) return 'I cannot teach you anything about this.';

      const skillValue = player.skills[skill] || 0;
      const skillLevel = player.calcSkillLevel(skill);

      const maxAssessSkill = npc.maxSkillTrain;

      if(skillLevel >= maxAssessSkill) return 'You are too advanced for my teachings.';

      const nextLevel = skillLevel === 0 ? 100 : player.calcSkillXP(skillLevel + 1);
      const prevLevel = skillLevel === 0 ? 0 : player.calcSkillXP(skillLevel);

      const normalizedCurrent = skillValue - prevLevel;
      const normalizedMax = nextLevel - prevLevel;

      const percentWay = Math.max(0, (normalizedCurrent/normalizedMax * 100)).toFixed(3);

      return `You are ${percentWay}% on your way towards the next level of ${skill.toUpperCase()} proficiency.`;
    });

  npc.parser.addCommand('train')
    .set('syntax', ['train'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';
      if(player.baseClass !== npc.classTrain) return 'I have nothing to teach you.';

      const level = player.level;
      if(level > npc.maxLevelUpLevel) return 'You are too advanced for my teachings.';

      player.tryLevelUp(npc.maxLevelUpLevel);
      const newLevel = player.level;

      if(newLevel === level) return 'You are not experienced enough to train with me.';

      return `You have gained ${newLevel-level} experience levels.`;
    });

  npc.parser.addCommand('join')
    .set('syntax', ['join'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';
      if(player.baseClass !== 'Undecided') return 'You have already joined a profession.';

      player.changeBaseClass(npc.classTrain);

      return `Welcome to the ${npc.classTrain} profession, ${player.name}!`;
    });
};
