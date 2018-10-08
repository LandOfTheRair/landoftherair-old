import { NPC } from '../../../../../shared/models/npc';
import { Holiday, HolidayHelper } from '../../../../../shared/helpers/holiday-helper';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';
  npc.affiliation = 'Pilgrim Helpers';

  npc.rightHand = await npc.$$room.npcLoader.loadItem('Thanksgiving Blunderbuss');
  npc.gear.Armor = await npc.$$room.npcLoader.loadItem('Risan Tunic');

  npc.recalculateStats();
};

export const responses = (npc: NPC) => {

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';

      if(!HolidayHelper.isHoliday(Holiday.Halloween)) return 'Come back when the leaves are turning.';

      if(player.rightHand) {
        if(player.rightHand.name === 'Thanksgiving Blunderbuss') {
          return 'Yeah, you got one. Just go shoot some turkeys.';
        }

        return 'Empty your right hand and I\'ll toss ya a spare blunderbuss. Hear the turkeys here don\'t take t\' much else.';
      }

      npc.$$room.npcLoader.loadItem('Thanksgiving Blunderbuss')
        .then(newItem => {
          player.setRightHand(newItem);
        });

      return 'Yeah, take a blunderbuss. I hear there\'s someone who can make \'em last longer, if that\'s something you\'re into.';
    });
};
