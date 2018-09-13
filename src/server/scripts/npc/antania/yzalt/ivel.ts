import { NPC } from '../../../../../shared/models/npc';

const DEER_CORPSE = 'deer corpse';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';
  npc.affiliation = 'Evil Aligner';
  npc.gainBaseStat('stealth', 20);

  npc.gear.Armor = await npc.$$room.npcLoader.loadItem('Antanian Tunic');
  npc.recalculateStats();
};

export const responses = (npc: NPC) => {

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';

      if(player.alignment === 'Evil') return 'You are already a disciple of evil!';

      if((npc.$$room.npcLoader.checkPlayerHeldItem(player, DEER_CORPSE, 'right')
        || npc.$$room.npcLoader.checkPlayerHeldItem(player, DEER_CORPSE, 'left'))) {

        npc.$$room.npcLoader.takePlayerItem(player, DEER_CORPSE, 'right');
        npc.$$room.npcLoader.takePlayerItem(player, DEER_CORPSE, 'left');

        player.changeAlignment('Evil');

        return 'You have clearly demonstrated how cruel you can be! Welcome to the brotherhood of Evil.';
      }

      return 'I am Ivel, the bastion of evil. Prove your worth to me by bringing to me the corpse of a pure forest animal!';
    });

};
