import { NPC } from '../../../../models/npc';
import { NPCLoader } from '../../../helpers/npc-loader';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';

  npc.leftHand = await NPCLoader.loadItem('Tutorial Yeti Skull');
  npc.rightHand = await NPCLoader.loadItem('Tutorial Key');
  npc.gear.Armor = await NPCLoader.loadItem('Antanian Tunic');

  npc.recalculateStats();
};

export const responses = (npc: NPC) => {

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, env) => {
      const p = env.player;
      return `Hello and welcome to The Land of the Rair, ${p.name}! It looks like you're stuck in here with me. But fret not! If you kill the nearby YETI and bring me his SKULL, I can give you a KEY to let you out of here.`;
    });

  npc.parser.addCommand('yeti')
    .set('syntax', ['yeti'])
    .set('logic', () => {
      return `Yes, yes. There is a yeti in the forest to the east. He plagues this small town, and no one would miss him if he were to, erm, expire. You may want to dedicate to a PROFESSION before taking him on, though.`;
    });

  npc.parser.addCommand('skull')
    .set('syntax', ['skull'])
    .set('logic', () => {
      return `Yeti skulls happen to be a prized item in these parts. No, I'm not some sort of weirdo! I'll trade you a KEY for his skull.`;
    });

  npc.parser.addCommand('key')
    .set('syntax', ['key'])
    .set('logic', () => {
      return `Yes, I'm willing to trade this key for the Yeti's skull. A small price for your freedom, wouldn't you say?`;
    });

  npc.parser.addCommand('profession')
    .set('syntax', ['profession'])
    .set('logic', () => {
      return `Rumor has it, there's an enclave of trainers that seek new recruits for their ranks. I don't know where to find them, but I can grant you VISION to help you on your way.`;
    });

  npc.parser.addCommand('vision')
    .set('syntax', ['vision'])
    .set('logic', () => {
      // TODO cast detect
      return `Here you go! Best of luck on finding them.`;
    });
};
