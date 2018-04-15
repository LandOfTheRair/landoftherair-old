import { NPC } from '../../../../../shared/models/npc';
import { NPCLoader } from '../../../../helpers/character/npc-loader';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';

  npc.gear.Armor = await NPCLoader.loadItem('Antanian Tunic');
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

      const questTodayIndex = NPCLoader.getCurrentDailyDayOfYear(player) % allQuests.length;
      const questToday = allQuests[questTodayIndex];

      if(player.level < 13) return 'While we would appreciate your help in the Maze, maybe you should go talk to Mayor Twean in Rylt.';

      if(NPCLoader.checkPlayerHeldItem(player, questToday.questItem)) {

        const requiredInSack = questToday.amount - 1;
        if(requiredInSack > 0) {
          let indexes = NPCLoader.getItemsFromPlayerSackByName(player, questToday.questItem);
          indexes = indexes.slice(0, questToday.amount);

          if(indexes.length < requiredInSack) return 'You do not have enough of what I asked for!';
          NPCLoader.takeItemsFromPlayerSack(player, indexes);
        }

        NPCLoader.takePlayerItem(player, questToday.questItem);

        player.completeDailyQuest(npc.name);

        player.gainGold(30000);
        player.gainExp(100000);

        const gainedResetPoints = player.skillTree.canGainResetPoints ? 3 : 0;
        player.skillTree.gainResetPoints(gainedResetPoints);

        player.sendClientMessage(`You received 100,000 XP, 30,000 gold and ${gainedResetPoints} RP!`);
        return `Thanks, ${player.name}! We'll see you tomorrow!`;
      }

      return `Hello, ${player.name}! We're trying to renovate our town and we need some materials to ward off monsters. 
      Can you find us ${questToday.name}? I'll need ${questToday.amount} of them.`;
    });

};
