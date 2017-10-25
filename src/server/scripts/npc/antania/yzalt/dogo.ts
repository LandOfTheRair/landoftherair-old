import { NPC } from '../../../../../shared/models/npc';
import { NPCLoader } from '../../../../helpers/npc-loader';

const TONWIN_SWORD = 'Tonwin Sword';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';
  npc.gainBaseStat('stealth', 20);

  npc.gear.Armor = await NPCLoader.loadItem('Antanian Tunic');
  npc.recalculateStats();
};

export const responses = (npc: NPC) => {

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 2) return 'Please move closer.';

      if(player.alignment === 'Neutral') return 'You are already a disciple of neutrality!';

      if(NPCLoader.checkPlayerHeldItem(player, TONWIN_SWORD)) {
        NPCLoader.takePlayerItem(player, TONWIN_SWORD);

        player.changeAlignment('Neutral');

        return 'You have demonstrated steadfast neutrality in the face of temptation. Upon you, I have bestowed the gift of neutrality. Use it wisely.';
      }


      return 'I am Ralteun, the bastion of neutrality. Bring me the blade coveted by the brothers three and I will restore neutrality unto thee!';
    });

};
