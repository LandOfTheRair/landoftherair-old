import { NPC } from '../../../../../shared/models/npc';

import { DailyKillDryads, DailyKillMiners, DailyKillWildlife } from '../../../../quests';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';

  npc.gear.Armor = await npc.$$room.npcLoader.loadItem('Risan Tunic');
  npc.recalculateStats();
};

export const responses = (npc: NPC) => {

  const allQuests = [DailyKillWildlife, DailyKillDryads, DailyKillMiners];
  const allQuestModifiers = ['wildlife', 'dryads', 'miner threats'];

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 2) return 'Please move closer.';

      if(!player.canDoDailyQuest(npc.name)) {
        return 'Thanks, but you\'ve done all you can today. Come back tomorrow - I\'m sure there\'ll be work for you.';
      }

      const questTodayIndex = npc.$$room.npcLoader.getCurrentDailyDayOfYear(player) % allQuests.length;
      const questToday = allQuests[questTodayIndex];

      if(player.hasQuest(questToday)) {
        if(questToday.isComplete(player)) {
          questToday.completeFor(player);
          player.completeDailyQuest(npc.name);

          return 'Thank you for taking care of that for me. You\'ve done this town a great service. Here\'s your reward.';
        }

        return questToday.incompleteText(player);
      }

      if(player.level <= 10) return 'We appreciate your help here in the miner town, but maybe you should talk to my acquaintance, Chief Bart, in the Maze.';

      player.startQuest(questToday);

      return `Hello, ${player.name}! We're having an issue with the ${allQuestModifiers[questTodayIndex]} today. 
      Do you think you can cull their numbers? It's really starting to look bad for us in the town, here.`;
    });

};
