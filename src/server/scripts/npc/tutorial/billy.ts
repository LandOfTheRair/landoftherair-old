import { NPC } from '../../../../shared/models/npc';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';
  npc.affiliation = 'Lost Child';

  npc.gear.Armor = await npc.$$room.npcLoader.loadItem('Antanian Tunic');
  npc.recalculateStats();
};

export const responses = (npc: NPC) => {

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', () => {
      return `Aw, shucks. Have you seen my pet Moose? It's so lonely in this town, I might have to move. There are just the MERCHANTS, the HERMIT, and me.`;
    });

  npc.parser.addCommand('merchants')
    .set('syntax', ['merchants'])
    .set('logic', () => {
      return `Yeah. The building to the south of here has some merchants. They sell armor, weapons, and potions. Nothin' there for a kid like me, though.`;
    });

  npc.parser.addCommand('hermit')
    .set('syntax', ['hermit'])
    .set('logic', () => {
      return `Old man Hermit is off in the distant house, northwest of here. I hear he has the key to let people out of this forsaken town, whatever that means.`;
    });

};
