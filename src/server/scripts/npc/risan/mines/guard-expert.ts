import { NPC } from '../../../../../shared/models/npc';

import { KillDistractions } from '../../../../quests';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';
  npc.affiliation = 'Distractions Expertologist';

  npc.rightHand = await npc.$$room.npcLoader.loadItem('Antanian Halberd');
  npc.gear.Armor = await npc.$$room.npcLoader.loadItem('Antanian Tunic');
  npc.recalculateStats();
};

export const responses = (npc: NPC) => {

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 2) return 'Please move closer.';

      if(player.hasQuest(KillDistractions)) {
        if(KillDistractions.isComplete(player)) {
          KillDistractions.completeFor(player);

          return 'Thank. Productive more.';
        }

        return KillDistractions.incompleteText(player);
      }

      return `DISTRACTION. Enemies. Rocks. Crazed. Help?`;
    });

  npc.parser.addCommand('distraction')
    .set('syntax', ['distraction'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 2) return 'Please move closer.';

      player.startQuest(KillDistractions);

      return `${KillDistractions.killsRequired} kill. Cave. Distractions. Evil. Enemy. Reward.`;
    });

};
