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
      if(player.level < 50 && !player.gainingAP) return 'You might want to come back when you\'re stronger.';

      return `Greetings, ${player.name}! I can provide you with a way to become more powerful, at the cost of killing more powerful creatures. Just tell me if you want to SWAP.`;
    });


  npc.parser.addCommand('swap')
    .set('syntax', ['swap'])
    .set('logic', (args, { player }) => {
      if(player.level < 50 && !player.gainingAP) return 'You might want to come back when you\'re stronger.';

      player.gainingAP = !player.gainingAP;

      if(player.gainingAP) return `Done. Now, you must kill elite creatures with strength that rivals your own, but you can gain powerful, ancient rewards instead!`;

      return 'Done. Now you will gain experience when killing creatures normally.';
    });
};
