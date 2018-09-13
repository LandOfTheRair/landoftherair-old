import { NPC } from '../../../../../shared/models/npc';

const SPIDER_EGG = 'Tower Spider Egg';
const FLOWER = 'Tower Goblood';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';
  npc.affiliation = 'Royal Cook';

  npc.gear.Armor = await npc.$$room.npcLoader.loadItem('Antanian Tunic');
  npc.recalculateStats();
};

export const responses = (npc: NPC) => {
  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';

      if(npc.$$room.npcLoader.checkPlayerHeldItemEitherHand(player, SPIDER_EGG) && npc.$$room.npcLoader.checkPlayerHeldItemEitherHand(player, FLOWER)) {
        npc.$$room.npcLoader.takePlayerItemFromEitherHand(player, SPIDER_EGG);
        npc.$$room.npcLoader.takePlayerItemFromEitherHand(player, FLOWER);

        npc.$$room.npcLoader.loadItem('Antanian Magic Potion')
          .then(item => {
            item.binds = true;
            player.setRightHand(item);
          });

        return 'Thanks! I hope you enjoy my concoction.';
      }

      return `Hail, adventurer. I know that because you don't look like you're from these parts. 
      Anyway, I'm a chef and I create my cuisine from, er, "interesting" ingredients. 
      For example, did you know if you mix a spider egg and an ounce of Goblood, it neutralizes the poison and increases the magic potential of the drinker? 
      That was a happy accident.`;
    });
};
