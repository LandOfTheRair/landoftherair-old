import { NPC } from '../../../../../shared/models/npc';
import { NPCLoader } from '../../../../helpers/npc-loader'
import { KillHeniz } from '../../../../quests/antania/Yzalt/KillHeniz';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';
  npc.allegiance = 'Royalty';

  npc.gear.Armor = await NPCLoader.loadItem('Antanian Tunic');
  npc.recalculateStats();
};

export const responses = (npc: NPC) => {

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';

      if(player.hasQuest(KillHeniz)) {
        if(KillHeniz.isComplete(player)) {
          KillHeniz.completeFor(player);

          return 'Your continued support is appreciated!';
        }

        return KillHeniz.incompleteText(player);
      }

      return `Greetings. I am one of the leaders of the Steffen. I maintain our relations with outsiders like yourself. 
      If you happen to be interested in becoming more friendly with us, I might be willing to HELP.`;
    });

  npc.parser.addCommand('help')
    .set('syntax', ['help'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';
      return `Yes, ${player.name}, you can help us greatly - we're at war with the Heniz in the south. 
      They attack our town repeatedly, and our citizens are starting to panic.
      I would like you to help our local defenders out. You could also join our assaulters in attacking their camp.
      Can you help us out?`;
    });

  npc.parser.addCommand('yes')
    .set('syntax', ['yes'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';

      player.startQuest(KillHeniz);

      return `Good luck, they're a treacherous bunch.`;
    });

};
