import { NPC } from '../../../../../shared/models/npc';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';
  npc.affiliation = 'Silver Services';

  npc.gear.Armor = await npc.$$room.npcLoader.loadItem('Antanian Tunic');

  npc.recalculateStats();
};

export const responses = (npc: NPC) => {

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      return `Greetings, ${player.name}! I am he who can tweak your items. 
      Just tell me one of these things, and I can tell you more: prone`;
    });


  npc.parser.addCommand('prone')
    .set('syntax', ['prone'])
    .set('logic', (args, { player }) => {

      const right = player.rightHand;
      const left = player.leftHand;

      if(right && left && right.name === left.name) {
        if(!right.isOwnedBy(player) || !left.isOwnedBy(player)) return 'You must own both of the items!';

        player.setLeftHand(null);
        player.rightHand.proneChance = 0;
        return 'Done! No more proning.';
      }

      return `Yes! I can remove proning from your item. Bring me two of the same weapon; I'll take the one in your left hand, and remove proning from the right.`;
    });
};
