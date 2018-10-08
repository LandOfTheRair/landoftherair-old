import { NPC } from '../../../../../shared/models/npc';
import { Holiday, HolidayHelper } from '../../../../../shared/helpers/holiday-helper';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';
  npc.affiliation = 'Pilgrim Helpers';

  npc.rightHand = await npc.$$room.npcLoader.loadItem('Thanksgiving Cornbread');
  npc.gear.Armor = await npc.$$room.npcLoader.loadItem('Risan Tunic');

  npc.recalculateStats();
};

export const responses = (npc: NPC) => {

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';

      if(!player.rightHand || !player.leftHand || player.rightHand.name !== 'Thanksgiving Corn' || player.leftHand.name !== 'Thanksgiving Corn') {
        return `Hello ${player.name}! I can bake you some corn bread - it's my specialty. Bring me two ears of corn and I'll hook you up!`;
      }

      npc.$$room.npcLoader.loadItem('Thanksgiving Cornbread')
        .then(newItem => {
          player.setRightHand(newItem);
          player.setLeftHand(null);
        });

      return `Here you go! You might even get lucky!`;
    });
};
