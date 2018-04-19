import { NPC } from '../../../../../shared/models/npc';
import { KillSteffen } from '../../../../quests/antania/Yzalt/KillSteffen';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';
  npc.allegiance = 'Pirates';

  npc.gear.Armor = await npc.$$room.npcLoader.loadItem('Antanian Tunic');
  npc.recalculateStats();
};

export const responses = (npc: NPC) => {

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';

      if(player.hasQuest(KillSteffen)) {
        if(KillSteffen.isComplete(player)) {
          KillSteffen.completeFor(player);

          return 'Your continued support is appreciated!';
        }

        return KillSteffen.incompleteText(player);
      }

      return `Greetings. I am one of the leaders of the Heniz people. I maintain our relations with outsiders like yourself. 
      If you happen to be interested in becoming more friendly with our kind, I might be willing to HELP.`;
    });

  npc.parser.addCommand('help')
    .set('syntax', ['help'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';
      return `Yes, ${player.name}, I could use your help. You see, we are at war with the Steffen in the north. 
      While our crazed brethren are a problem, the more pressing matter is the Steffen that attack our camp.
      I would like you to help our local defenders out. You could also join our assaulters in attacking their town.
      Can you do this for me?`;
    });

  npc.parser.addCommand('yes')
    .set('syntax', ['yes'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';

      player.startQuest(KillSteffen);

      return `Thank you, ${player.name}. Best of luck out there.`;
    });

};
