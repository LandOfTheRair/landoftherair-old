import { NPC } from '../../../../../shared/models/npc';
import { NPCLoader } from '../../../../helpers/npc-loader';

const TONWIN_SWORD = 'Tonwin Sword';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';

  npc.rightHand = await NPCLoader.loadItem('Gold Coin');
  npc.gear.Armor = await NPCLoader.loadItem('Antanian Tunic');
  npc.recalculateStats();
};

export const responses = (npc: NPC) => {
  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';
      return `Help! Help! Heeeeeelp! He-oh, hey, it's a person! My BROTHERS and I are trapped here, can you HELP?`;
    });

  npc.parser.addCommand('brothers')
    .set('syntax', ['brothers'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';
      return `Yes. My eldest brother, TONWIN, imprisoned myself, TAKWIN, and TERWIN here. We were all tricked!`;
    });

  npc.parser.addCommand('help')
    .set('syntax', ['help'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';
      return `Yes, you can get us out of here. I fear we're magically bound to this prison, though. I bet if you could win against TONWIN, we could be free!`;
    });

  npc.parser.addCommand('tonwin')
    .set('syntax', ['tonwin'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';
      return `Yes, Tonwin tricked us all. 
      He convinced us all to work against each other, bringing us deeper and deeper into the prison and imprisoning us separately from each other. 
      All the while, he was convincing us we would get something out of it. 
      Money, fame, strength, you know how it goes. We were greedy.`;
    });

  npc.parser.addCommand('takwin')
    .set('syntax', ['takwin'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';
      return `Takwin was the closest to TONWIN. He's probably very close to Tonwin; he always trusted Takwin's counsel. 
      I bet he would give you the strength he desired if you could help him.`;
    });

  npc.parser.addCommand('terwin')
    .set('syntax', ['terwin'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';
      return `Terwin always was a bit of an outcast to us. Who knows what was done with him, or if he's even alive? 
      He probably can't give you the fame he so desired, but I'm sure he could help you in other ways.`;
    });

  npc.parser.addCommand('telwin')
    .set('syntax', ['telwin'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';
      return `Yes, yes. You see, I wanted money. With it, I could live comfortably in a Steffen castle. 
      If you bring me PROOF of Tonwin's death, I can reward you with what I have.`;
    });

  npc.parser.addCommand('proof')
    .set('syntax', ['proof'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';

      if(NPCLoader.checkPlayerHeldItem(player, TONWIN_SWORD)) {
        NPCLoader.takePlayerItem(player, TONWIN_SWORD);

        NPCLoader.loadItem('Gold Coin')
          .then(item => {
            item.value = 20000;
            player.setRightHand(item);
          });

        return `Thank you, ${player.name}. Here is your reward for my freedom!`;
      }

      return `I don't see any proof.`;
    });
};
