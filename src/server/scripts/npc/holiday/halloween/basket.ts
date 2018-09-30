import { NPC } from '../../../../../shared/models/npc';
import { Holiday, HolidayHelper } from '../../../../../shared/helpers/holiday-helper';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';
  npc.affiliation = 'Halloween Helpers';

  npc.rightHand = await npc.$$room.npcLoader.loadItem('Halloween Basket');
  npc.gear.Armor = await npc.$$room.npcLoader.loadItem('Risan Tunic');

  npc.recalculateStats();
};

export const responses = (npc: NPC) => {

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';

      if(!HolidayHelper.isHoliday(Holiday.Halloween)) return 'Come back when there are pumpkins on the street.';
      if(player.rightHand) {
        if(player.rightHand.name === 'Halloween Basket') {
          return 'Forgot how to use that already, eh? Right click on any friendly creature or tell them "trick or treat" and they\'ll probably give you some candy. Probably.';
        }
        return 'Empty your right hand and I can hook you up, mate.';
      }

      npc.$$room.npcLoader.loadItem('Halloween Basket')
        .then(newItem => {
          player.setRightHand(newItem);
        });

      return 'There you are! Right click on any friendly creature or tell them "trick or treat" and they\'ll probably give you some candy. Probably.';
    });
};
