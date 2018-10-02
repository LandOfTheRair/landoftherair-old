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
      return `Greetings, ${player.name}! I am he who can BIND items to thee.`;
    });


  npc.parser.addCommand('bind')
    .set('syntax', ['bind'])
    .set('logic', (args, { player }) => {
      const item = player.rightHand;

      if(!item) return 'You must be holding an item in your right hand!';
      if(item.owner) return 'That item already has an owner!';

      item.owner = player.username;
      return 'Done! It is now yours.';
    });
};
