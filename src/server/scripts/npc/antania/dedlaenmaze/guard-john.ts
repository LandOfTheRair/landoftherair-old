import { NPC } from '../../../../../shared/models/npc';

import { KillDarkMinions } from '../../../../quests';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';
  npc.affiliation = 'Retired Maze Guard';

  npc.rightHand = await npc.$$room.npcLoader.loadItem('Antanian Halberd');
  npc.gear.Armor = await npc.$$room.npcLoader.loadItem('Antanian Tunic');
  npc.recalculateStats();
};

export const responses = (npc: NPC) => {

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 2) return 'Please move closer.';

      if(player.hasQuest(KillDarkMinions)) {
        if(KillDarkMinions.isComplete(player)) {
          KillDarkMinions.completeFor(player);

          return 'Thanks. Fewer spooks means less danger to our townsfolk.';
        }

        return KillDarkMinions.incompleteText(player);
      }

      return `Hey! An adventurer! We could use your HELP down here, dark minions are slaughtering our townspeople!`;
    });

  npc.parser.addCommand('help')
    .set('syntax', ['help'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 2) return 'Please move closer.';

      player.startQuest(KillDarkMinions);

      return `Yeah, kill ${KillDarkMinions.killsRequired} dark minions - skeletons and their kin. Our townspeople stand no chance against these foul beings. 
      You can find them to the west of the entrance.`;
    });

};
