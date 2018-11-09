import { NPC } from '../../../../../shared/models/npc';
import { SantasReindeer } from '../../../../quests';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';
  npc.affiliation = 'Christmas Helpers';

  npc.gear.Armor = await npc.$$room.npcLoader.loadItem('Risan Tunic');

  npc.recalculateStats();
};

export const responses = (npc: NPC) => {

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';

      if(player.hasQuest(SantasReindeer)) {
        if(SantasReindeer.isComplete(player)) {
          if(player.rightHand) return 'Please empty your right hand!';

          SantasReindeer.completeFor(player);

          npc.$$room.npcLoader.putItemInPlayerHand(player, 'Christmas Wreath Ring');

          return 'Hey, thanks! Take this as a sign of my gratitude for saving Christmas!';
        }

        return SantasReindeer.incompleteText(player);
      }

      player.startQuest(SantasReindeer);

      return `Hey! Hey, you! Can you help me find Santa's reindeer? There are 8 in total, and I need to get them ready to go! 
      They like walnuts, I think they might have left because they were hungry... I might have forgotten to feed them, oops.`;
    });
};
