import { NPC } from '../../../../../shared/models/npc';
import { DailyKillBrigands, DailyKillThermidors, DailyKillYetis, DailyKillCats } from '../../../../quests';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';

  npc.rightHand = await npc.$$room.npcLoader.loadItem('Risan Halberd');
  npc.gear.Armor = await npc.$$room.npcLoader.loadItem('Risan Breastplate');

  npc.recalculateStats();
};

export const responses = (npc: NPC) => {

  const allQuests = [DailyKillBrigands, DailyKillYetis, DailyKillCats, DailyKillThermidors];
  const allQuestModifiers = ['brigands', 'yeti', 'cats', 'lake people'];

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 2) return 'Please move closer.';

      if(!player.canDoDailyQuest(npc.name)) {
        return 'Thanks, but we\'re capable of handling the remaining threats today. Your services will no longer be needed today.';
      }

      const questTodayIndex = npc.$$room.npcLoader.getCurrentDailyDayOfYear(player) % allQuests.length;
      const questToday = allQuests[questTodayIndex];

      if(player.hasQuest(questToday)) {
        if(questToday.isComplete(player)) {
          questToday.completeFor(player);
          player.completeDailyQuest(npc.name);

          return 'Here\'s your reward, now scram.';
        }

        return questToday.incompleteText(player);
      }

      if(player.level <= 21) return 'We could use the help from the likes of you, but you might want to head to see the Interim Overseer in the Mines.';

      player.startQuest(questToday);

      return `Greetings, adventurer. We're having an issue with the ${allQuestModifiers[questTodayIndex]} today, 
      and our militia isn't equipped to handle all of it. If you help us cull their numbers, we'll split the reward with you.`;
    });
};
