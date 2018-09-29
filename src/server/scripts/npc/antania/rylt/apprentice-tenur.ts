import { NPC } from '../../../../../shared/models/npc';

import { KillApprentices } from '../../../../quests';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';
  npc.affiliation = 'Eternal Apprentice';

  npc.rightHand = await npc.$$room.npcLoader.loadItem('Antanian Staff');
  npc.gear.Armor = await npc.$$room.npcLoader.loadItem('Antanian Tunic');
  npc.recalculateStats();
};

export const responses = (npc: NPC) => {

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 2) return 'Please move closer.';

      if(player.hasQuest(KillApprentices)) {
        if(KillApprentices.isComplete(player)) {
          KillApprentices.completeFor(player);

          return 'Thanks! I\'m gonna be the best apprentice now, you\'ll see!';
        }

        return KillApprentices.incompleteText(player);
      }

      return `Adventurer! Adventurer! I request your help in becoming Saraxa's best apprentice! Can you HELP me?`;
    });

  npc.parser.addCommand('help')
    .set('syntax', ['help'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 2) return 'Please move closer.';

      player.startQuest(KillApprentices);

      return `Yes, please kill ${KillApprentices.killsRequired} apprentices and their shoddy golems. With them out of the way, I'll be the best apprentice!`;
    });

};
