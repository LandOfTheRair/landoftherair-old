import { NPC } from '../../../../../shared/models/npc';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';
  npc.affiliation = 'Colonial Explorers';

  npc.rightHand = await npc.$$room.npcLoader.loadItem('Thanksgiving Bead Amulet');
  npc.gear.Armor = await npc.$$room.npcLoader.loadItem('Risan Tunic');

  npc.recalculateStats();
};

export const responses = (npc: NPC) => {

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 2) return 'Please move closer.';

      if(player.hasHeldItems('Thanksgiving Cornbread', 'Thanksgiving Corn')) {
        npc.$$room.npcLoader.loadItem('Thanksgiving Bead Amulet')
          .then(newItem => {
            player.setRightHand(newItem);
            player.setLeftHand(null);
          });

        return 'Mmmhmm! Oh man, so good! Here, the natives made me this, but I think you should have it.';
      }

      return 'Mmm! This corn is great. But so is this cornbread... Hey, I have an idea, can you bring me both?';
    });
};
