import { NPC } from '../../../../shared/models/npc';
import { NPCLoader } from '../../../helpers/character/npc-loader';

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
    .set('logic', (args, { player }) => {
      if(NPCLoader.checkPlayerHeldItem(player, 'Tutorial Yeti Skull')) {
        NPCLoader.takePlayerItem(player, 'Tutorial Yeti Skull');
        NPCLoader.givePlayerItem(player, 'Tutorial Key');
        return `Ah, thank you ${player.name}! I see you've brought me the skull of the feared yeti. 
        Here, you can have this key. Now go out into the world and do great things!`;
      }

      return `Hello and welcome to The Land of the Rair, ${player.name}! It looks like you're stuck in here with me. 
      But fret not, I can HELP you! [Hint: You can talk with NPCs by saying their name, comma, then what you want to ask about. 
      For example, in command mode, say "her, help"]`;
    });

  npc.parser.addCommand('help')
    .set('syntax', ['help'])
    .set('logic', () => {
      return `Yes, I can help you, and you can help me. If you kill the nearby YETI and bring me his SKULL - just hold it in your right hand. 
      If ya do that, I can give you a KEY to let you out of here.`;
    });

  npc.parser.addCommand('yeti')
    .set('syntax', ['yeti'])
    .set('logic', () => {
      return `Yes, yes. There is a yeti in the forest to the east. He plagues this small town, and no one would miss him if he were to, erm, expire. 
      You may want to dedicate to a PROFESSION before taking him on, though.`;
    });

  npc.parser.addCommand('skull')
    .set('syntax', ['skull'])
    .set('logic', () => {
      return `Yeti skulls happen to be a prized item in these parts. No, I'm not some sort of weirdo! I'll trade you a KEY for his skull. 
      Just hold it in your hand, and greet me again! Note also that the skull must BELONG to you!`;
    });

  npc.parser.addCommand('belong')
    .set('syntax', ['belong'])
    .set('logic', () => {
      return `Yes, yes. Some items have a faint warm sensation upon grasping them. 
      It truly is a strange phenomena, but it means that you own that item, and no one else can use it. 
      That's how I'll known you've completed your trial!`;
    });

  npc.parser.addCommand('key')
    .set('syntax', ['key'])
    .set('logic', () => {
      return `Yes, I'm willing to trade this key for the Yeti's skull. A small price for your freedom, wouldn't you say?`;
    });

  npc.parser.addCommand('profession')
    .set('syntax', ['profession'])
    .set('logic', () => {
      return `Rumor has it, there's an enclave of trainers that seek new recruits for their ranks. 
      I don't know where to find them, but I can grant you VISION to help you on your way.`;
    });

  npc.parser.addCommand('vision')
    .set('syntax', ['vision'])
    .set('logic', (args, { player }) => {
      NPCLoader.givePlayerEffect(player, 'TrueSight', { duration: 100 });
      return `Here you go! Best of luck on finding them. They're holed up right outside here, a bit north. See if you can tell where they are! 
      [Hint: Check your status bar, below the map, to see your buffs!]`;
    });
};
