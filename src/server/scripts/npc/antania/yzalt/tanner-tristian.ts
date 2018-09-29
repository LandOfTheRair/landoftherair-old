import { NPC } from '../../../../../shared/models/npc';

import { KillRats } from '../../../../quests';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';
  npc.affiliation = 'Traveling Tanner';

  npc.rightHand = await npc.$$room.npcLoader.loadItem('Antanian Longsword');
  npc.gear.Armor = await npc.$$room.npcLoader.loadItem('Yzalt SewerRat Fur');
  npc.recalculateStats();
};

export const responses = (npc: NPC) => {

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 2) return 'Please move closer.';

      if(player.hasQuest(KillRats)) {
        if(KillRats.isComplete(player)) {
          KillRats.completeFor(player);

          return 'Thanks! You\'ve helped a lot with my travels.';
        }

        return KillRats.incompleteText(player);
      }

      return `Yay, an adventurer! Can you HELP me get through here?`;
    });

  npc.parser.addCommand('help')
    .set('syntax', ['help'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 2) return 'Please move closer.';

      player.startQuest(KillRats);

      return `Yes, I need to travel to... somewhere. Somewhere through here. But there are too many rats in my way.
      Can you take care of about ${KillRats.killsRequired}? I think that will be enough to grant me safe passage.`;
    });

};
