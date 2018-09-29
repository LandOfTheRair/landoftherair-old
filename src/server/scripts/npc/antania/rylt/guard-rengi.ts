import { NPC } from '../../../../../shared/models/npc';

import { KillRenegades } from '../../../../quests';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';
  npc.affiliation = 'Outpost Guard Captain';

  npc.rightHand = await npc.$$room.npcLoader.loadItem('Antanian Halberd');
  npc.gear.Armor = await npc.$$room.npcLoader.loadItem('Antanian Tunic');
  npc.recalculateStats();
};

export const responses = (npc: NPC) => {

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 2) return 'Please move closer.';

      if(player.hasQuest(KillRenegades)) {
        if(KillRenegades.isComplete(player)) {
          KillRenegades.completeFor(player);

          return 'Thanks, mate. These renegades don\'t take care of themselves, ya know?';
        }

        return KillRenegades.incompleteText(player);
      }

      return `Well, look at that, an adventurer in my outpost. Want a reward? I could use some AID.`;
    });

  npc.parser.addCommand('aid')
    .set('syntax', ['aid'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 2) return 'Please move closer.';

      player.startQuest(KillRenegades);

      return `Yep. I need you to put ${KillRenegades.killsRequired} renegades to the axe. They're doing nothing but causing problems for us lately.`;
    });

};
