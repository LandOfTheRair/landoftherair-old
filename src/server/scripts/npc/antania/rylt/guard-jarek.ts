import { NPC } from '../../../../../shared/models/npc';
import { NPCLoader } from '../../../../helpers/npc-loader';

import { KillRebels } from '../../../../quests';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';

  npc.rightHand = await NPCLoader.loadItem('Antanian Halberd');
  npc.gear.Armor = await NPCLoader.loadItem('Antanian Tunic');
  npc.recalculateStats();
};

export const responses = (npc: NPC) => {

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 2) return 'Please move closer.';

      if(player.hasQuest(KillRebels)) {
        if(KillRebels.isComplete(player)) {
          KillRebels.completeFor(player);

          return 'Thank you for taking care of that for me. Here\'s your reward, and if you need me, I\'ll be buried in paperwork...';
        }

        return KillRebels.incompleteText(player);
      }

      return `Hello, ${player.name}! Don't mind me and this stack of paperwork, I've been having troubles with the PRISONERS lately.`;
    });

  npc.parser.addCommand('prisoners')
    .set('syntax', ['prisoners'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 2) return 'Please move closer.';
      return `Why, yes. They've been doing nothing but trying to riot down there, as if they could actually get out. 
      Regardless, I could use some HELP containing them.`;
    });

  npc.parser.addCommand('help')
    .set('syntax', ['help'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 2) return 'Please move closer.';

      player.startQuest(KillRebels);

      return `Yes, please kill ${KillRebels.killsRequired} prisoners for me. Actually kill them. 
      There's no paperwork to deal with if they're no longer living, you see. Get it done, and get it done fast. 
      I'll give you a reward of 2,000 gold if you do -- 100 gold per prisoner killed.`;
    });

};
