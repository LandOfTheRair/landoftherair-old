import { NPC } from '../../../../models/npc';
import { NPCLoader } from '../../../helpers/npc-loader';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';

  const vendorItems = [
    'Antanian Tunic',
    'Antanian Studded Tunic',
    'Antanian Scalemail Tunic',
    'Antanian Ringmail Tunic',
    'Antanian Breastplate',
    'Antanian Cloak'
  ];

  NPCLoader.loadVendorItems(npc, vendorItems);

  npc.rightHand = await NPCLoader.loadItem('Antanian Longsword');
  npc.gear.Armor = await NPCLoader.loadItem('Antanian Breastplate');

  npc.recalculateStats();
};

export const responses = (npc: NPC) => {
  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, env) => {
      const p = env.player;
      if(npc.distFrom(p) > 2) return 'Please move closer.';
      return '';
    });
};
