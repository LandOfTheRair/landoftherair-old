import { NPC } from '../../../../../shared/models/npc';
import { SantasReindeer } from '../../../../quests';

const REINDEER = 'vixen';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';
  npc.affiliation = 'Christmas Helpers';

  npc.gear.Armor = await npc.$$room.npcLoader.loadItem('Christmas Reindeer Skin');

  npc.recalculateStats();
};

export const responses = (npc: NPC) => {

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';

      if(!player.hasQuest(SantasReindeer)) player.startQuest(SantasReindeer);

      const data = player.getQuestData(SantasReindeer);
      if(data[REINDEER]) return 'Thanks! I\'ll head back to Alf right away.';

      if(!player.rightHand || player.rightHand.name !== 'Christmas Walnuts') return 'I\'m so hungry...';

      player.setRightHand(null);
      SantasReindeer.updateProgress(player, { reindeer: REINDEER });

      return `Thanks! I'll head back to Alf right away.`;
    });
};
