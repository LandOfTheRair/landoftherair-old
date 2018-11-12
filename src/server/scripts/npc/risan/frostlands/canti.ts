import { NPC } from '../../../../../shared/models/npc';
import { ClubAccess } from '../../../../quests';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';

  npc.rightHand = await npc.$$room.npcLoader.loadItem('Club Earring');
  npc.gear.Armor = await npc.$$room.npcLoader.loadItem('Club Shirt');

  npc.recalculateStats();
};

export const responses = (npc: NPC) => {

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {

      if(npc.$$room.npcLoader.checkPlayerHeldItem(player, 'Silver Scale')) {
        npc.$$room.npcLoader.takePlayerItemFromEitherHand(player, 'Silver Scale');

        npc.$$room.npcLoader.putItemInPlayerHand(player, `Club Earring`);

        if(!player.hasQuest(ClubAccess)) {
          player.startQuest(ClubAccess);
          ClubAccess.completeFor(player);
        }

        return 'Excellent work. Good luck with your initiation!';
      }

      return 'Bring me a scale of silver!';
    });
};
