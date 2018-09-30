import { NPC } from '../../../../../shared/models/npc';
import { HolidayHelper } from '../../../../../shared/helpers/holiday-helper';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';
  npc.affiliation = 'Maze Chief';

  npc.gear.Armor = await npc.$$room.npcLoader.loadItem('Antanian Tunic');
  npc.recalculateStats();
};

export const responses = (npc: NPC) => {

  const allQuests = [
    { questItem: 'Rotting Mummy Grub', amount: 5, name: 'some grubs that eat decaying flesh' },
    { questItem: 'Perfect Maze Skull', amount: 1, name: 'the skull of a skeleton' }
  ];

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 2) return 'Please move closer.';

      if(!player.canDoDailyQuest(npc.name)) {
        return 'Thanks, but we don\'t want to work you too hard! Come back tomorrow - we\'ll have more work for you.';
      }

      const questTodayIndex = npc.$$room.npcLoader.getCurrentDailyDayOfYear(player) % allQuests.length;
      const questToday = allQuests[questTodayIndex];

      if(player.level < 13) return 'While we would appreciate your help in the Maze, maybe you should go talk to Mayor Twean in Rylt.';

      if(npc.$$room.npcLoader.checkPlayerHeldItem(player, questToday.questItem)) {

        const requiredInSack = questToday.amount - 1;
        if(requiredInSack > 0) {
          let indexes = npc.$$room.npcLoader.getItemsFromPlayerSackByName(player, questToday.questItem);
          indexes = indexes.slice(0, questToday.amount);

          if(indexes.length < requiredInSack) return 'You do not have enough of what I asked for!';
          npc.$$room.npcLoader.takeItemsFromPlayerSack(player, indexes);
        }

        npc.$$room.npcLoader.takePlayerItem(player, questToday.questItem);

        player.completeDailyQuest(npc.name);

        player.earnGold(30000, 'Quest:MazeDaily');
        player.gainExp(100000);
        player.$$room.subscriptionHelper.giveSilver(player.$$account, 1);

        const gainedResetPoints = player.skillTree.canGainResetPoints ? 3 : 0;
        player.skillTree.gainResetPoints(gainedResetPoints);

        player.sendClientMessage(`You received 100,000 XP, 30,000 gold, 1 silver and ${gainedResetPoints} RP!`);

        HolidayHelper.tryGrantHolidayTokens(player, 25);

        return `Thanks, ${player.name}! We'll see you tomorrow!`;
      }

      return `Hello, ${player.name}! We're trying to renovate our town and we need some materials to ward off monsters. 
      Can you find us ${questToday.name}? I'll need ${questToday.amount} of them.`;
    });

};
