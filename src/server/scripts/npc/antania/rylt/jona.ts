import { NPC } from '../../../../../shared/models/npc';

import { RenegadeFeathers } from '../../../../quests';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';
  npc.gear.Armor = await npc.$$room.npcLoader.loadItem('Antanian Tunic');
  npc.recalculateStats();
};

export const responses = (npc: NPC) => {

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 2) return 'Please move closer.';

      if(player.hasPermanentCompletionFor('RenegadeFeathers')) return 'Thanks for the feather!';

      if(player.hasQuest(RenegadeFeathers)) {
        if(RenegadeFeathers.isComplete(player)) {
          RenegadeFeathers.completeFor(player);
          player.completeDailyQuest(npc.name);

          return `Thanks, ${player.sex === 'M' ? 'mister' : 'miss'}! I'm gonna go brag to them later about how I got one of their feathers!`;
        }

        return RenegadeFeathers.incompleteText(player);
      }

      player.startQuest(RenegadeFeathers);

      return `Hewwo, can you help me? I want a pink feather from the renegades!`;
    });

};
