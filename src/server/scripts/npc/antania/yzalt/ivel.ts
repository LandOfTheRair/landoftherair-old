import { NPC } from '../../../../../shared/models/npc';
import { NPCLoader } from '../../../../helpers/npc-loader';

const DEER_CORPSE = 'deer corpse';
const DOLPHIN_CORPSE = 'dolphin corpse';

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

      if(player.alignment === 'Evil') return 'You are already a disciple of evil!';

      if((NPCLoader.checkPlayerHeldItem(player, DEER_CORPSE, 'right')
        || NPCLoader.checkPlayerHeldItem(player, DEER_CORPSE, 'left'))) {

        NPCLoader.takePlayerItem(player, DEER_CORPSE, 'right');
        NPCLoader.takePlayerItem(player, DEER_CORPSE, 'left');

        player.changeAlignment('Evil');

        return 'You have clearly demonstrated how cruel you can be! Welcome to the brotherhood of Evil.';
      }

      return 'I am Ivel, the bastion of evil. Prove your worth to me by bringing to me the corpse of a pure forest animal!';
    });

};
