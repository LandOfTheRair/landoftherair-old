import { NPC } from '../../../../../shared/models/npc';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';
  npc.affiliation = 'Colonial Explorers';

  npc.rightHand = await npc.$$room.npcLoader.loadItem('Thanksgiving Blunderbuss');
  npc.gear.Armor = await npc.$$room.npcLoader.loadItem('Risan Tunic');

  npc.recalculateStats();
};

export const responses = (npc: NPC) => {

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 2) return 'Please move closer.';

      return `Hey! So... our pet turkey Koda went missing. You look like you could find your way around the forest. 
      If you find him, he likes to collect feathers. He\'s a bit odd...`;
    });
};
