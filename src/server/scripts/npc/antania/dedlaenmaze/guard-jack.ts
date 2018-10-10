import { NPC } from '../../../../../shared/models/npc';

import { KillSpooks } from '../../../../quests';

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

      if(player.hasQuest(KillSpooks)) {
        if(KillSpooks.isComplete(player)) {
          KillSpooks.completeFor(player);

          return 'Thanks. Fewer spooks means more business in this place.';
        }

        return KillSpooks.incompleteText(player);
      }

      return `Hey! An adventurer! We could use your HELP down here, our business is suffering!`;
    });

  npc.parser.addCommand('help')
    .set('syntax', ['help'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 2) return 'Please move closer.';

      player.startQuest(KillSpooks);

      return `Please remove ${KillSpooks.killsRequired} spooks from this poor place. They haunt our town and ruin our business. You can find them to the south of the entrance.`;
    });

};
