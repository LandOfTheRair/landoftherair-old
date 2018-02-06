import { NPC } from '../../../../../shared/models/npc';
import { NPCLoader } from '../../../../helpers/npc-loader';

const TONWIN_SWORD = 'Tonwin Sword';
const TAKWIN_GIFT = 'Takwin Shield';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';

  npc.rightHand = await NPCLoader.loadItem(TAKWIN_GIFT);
  npc.gear.Armor = await NPCLoader.loadItem('Antanian Tunic');
  npc.recalculateStats();
};

export const responses = (npc: NPC) => {
  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';
      return `I'm Takwin, but if you're here, you probably already knew that. Telwin is the only one who knows the way here -- he did DESIGN these prisons, after all.`;
    });

  npc.parser.addCommand('design')
    .set('syntax', ['design'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';
      return `Telwin is a master architect. I've seen his tribute, his altar, and I've seen what lies beneath here. Whatever it is, it must have POSSESSED Tonwin -- I don't think he could have betrayed us by himself.`;
    });

  npc.parser.addCommand('possessed')
    .set('syntax', ['possessed'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';
      return `Possessed is the word I would use. Some spirit or ghost or whatever they're called came out of the Altar. It gave Tonwin a murderous look in his eye -- I've never seen anything like it. I'm afraid he must be STOPPED.`;
    });

  npc.parser.addCommand('stopped')
    .set('syntax', ['stopped'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';
      return `The only way to stop him is to kill him. I wish there were another way. If you can bring me PROOF of his death, I can impart our family memento unto you.`;
    });

  npc.parser.addCommand('proof')
    .set('syntax', ['proof'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';

      if(NPCLoader.checkPlayerHeldItem(player, TONWIN_SWORD)) {
        NPCLoader.takePlayerItem(player, TONWIN_SWORD);

        NPCLoader.loadItem(TAKWIN_GIFT)
          .then(item => {
            player.setRightHand(item);
          });

        return `Thank you, ${player.name}. Here is our family heirloom! May it protect you more than it did us!`;
      }

      return `I don't see any proof.`;
    });
};
