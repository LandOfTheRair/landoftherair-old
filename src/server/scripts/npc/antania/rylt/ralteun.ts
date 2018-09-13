import { NPC } from '../../../../../shared/models/npc';

const TONWIN_SWORD = 'Tonwin Sword';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';
  npc.affiliation = 'Neutral Aligner';
  npc.gainBaseStat('stealth', 20);

  npc.gear.Armor = await npc.$$room.npcLoader.loadItem('Antanian Tunic');
  npc.recalculateStats();
};

export const responses = (npc: NPC) => {

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';

      if(player.alignment === 'Neutral') return 'You are already a disciple of neutrality!';

      if(npc.$$room.npcLoader.checkPlayerHeldItem(player, TONWIN_SWORD)) {
        npc.$$room.npcLoader.takePlayerItem(player, TONWIN_SWORD);

        player.changeAlignment('Neutral');

        return 'You have demonstrated steadfast neutrality in the face of temptation. Upon you, I have bestowed the gift of neutrality. Use it wisely.';
      }


      return 'I am Ralteun, the bastion of neutrality. Bring me the blade coveted by the brothers three and I will restore neutrality unto thee!';
    });

};
