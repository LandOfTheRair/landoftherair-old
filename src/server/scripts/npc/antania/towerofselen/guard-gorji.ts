import { NPC } from '../../../../../shared/models/npc';

import { KillOrcs } from '../../../../quests';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';
  npc.affiliation = 'Tower Guard Captain';

  npc.rightHand = await npc.$$room.npcLoader.loadItem('Antanian Halberd');
  npc.gear.Armor = await npc.$$room.npcLoader.loadItem('Antanian Tunic');
  npc.recalculateStats();
};

export const responses = (npc: NPC) => {

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 2) return 'Please move closer.';

      if(player.hasQuest(KillOrcs)) {
        if(KillOrcs.isComplete(player)) {
          KillOrcs.completeFor(player);

          return 'Great. These orcos don\'t take care of themselves, ya know?';
        }

        return KillOrcs.incompleteText(player);
      }

      return `Well, look at that, you want to climb the tower? HELP us, and we can make your climb easier.`;
    });

  npc.parser.addCommand('help')
    .set('syntax', ['help'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 2) return 'Please move closer.';

      player.startQuest(KillOrcs);

      return `Yep. I need you to slay ${KillOrcs.killsRequired} orckin. They invade our town, but we don't have the resources to strike back.`;
    });

};
