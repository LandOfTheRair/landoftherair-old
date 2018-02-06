import { NPC } from '../../../../../shared/models/npc';
import { NPCLoader } from '../../../../helpers/npc-loader';

const BEAR_MEAT = 'Antanian Bear Meat';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';

  npc.rightHand = await NPCLoader.loadItem(BEAR_MEAT);
  npc.gear.Armor = await NPCLoader.loadItem('Antanian Breastplate');
  npc.recalculateStats();
};

export const responses = (npc: NPC) => {
  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';

      return `Greetings, adventurer. I am the ranger who collects bear meat. You see, I really like bear meat. It was my destiny to collect it. If you can bring me some bear meat, we can help each other. You can SELL it to me, I can UPGRADE your gear, or I can give you an ANTIDOTE to help you with the local wildlife.`;
    });

  npc.parser.addCommand('sell')
    .set('syntax', ['sell'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';

      if(NPCLoader.checkPlayerHeldItem(player, BEAR_MEAT, 'left')) {

        let total = 150;
        NPCLoader.takePlayerItem(player, BEAR_MEAT, 'left');

        const indexes = NPCLoader.getItemsFromPlayerSackByName(player, BEAR_MEAT);
        total += indexes.length * 150;

        NPCLoader.takeItemsFromPlayerSack(player, indexes);

        player.gainGold(total);
        return `Thanks, ${player.name}! Here is ${total.toLocaleString()} gold for your efforts.`;
      }

      return `Hold one meat in your left hand, and I'll take that one as well as every one you're carrying. You can have 150 gold for each meat! Be sure you want to do this!`;
    });

  npc.parser.addCommand('upgrade')
    .set('syntax', ['upgrade'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';

      const REQUIRED_MEATS = 4;

      if(NPCLoader.checkPlayerHeldItem(player, BEAR_MEAT, 'left')) {

        const right = player.rightHand;
        if(!right) return 'Please hold an item in your right hand.';
        right.stats.offense = right.stats.offense || 0;
        if(right.stats.offense !== 0) return 'That item already has offensive adds!';

        let indexes = NPCLoader.getItemsFromPlayerSackByName(player, BEAR_MEAT);
        indexes = indexes.slice(0, REQUIRED_MEATS);

        if(indexes.length < REQUIRED_MEATS) return 'You do not have enough bear meat for that!';

        NPCLoader.takePlayerItem(player, BEAR_MEAT, 'left');
        NPCLoader.takeItemsFromPlayerSack(player, indexes);

        right.stats.offense += 1;
        player.recalculateStats();

        return `Thanks, ${player.name}! I've upgraded your ${player.rightHand.itemClass.toLowerCase()}. And thanks for the meat, I'm going to have a good dinner tonight!`;
      }

      return `Hold one meat in your left hand, and I'll take that one plus four from your sack. Hold a piece of gear with no offensive adds in your right hand, and it will help you better in combat!`;
    });

  npc.parser.addCommand('antidote')
    .set('syntax', ['antidote'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';

      if(NPCLoader.checkPlayerHeldItem(player, BEAR_MEAT, 'left')) {

        const right = player.rightHand;
        if(!right || right.name !== 'Mend Bottle') return 'Please hold a small healing bottle in your right hand.';

        const REQUIRED_MEATS = right.ounces;

        if(right.ounces > 1) {
          let indexes = NPCLoader.getItemsFromPlayerSackByName(player, BEAR_MEAT);
          indexes = indexes.slice(0, REQUIRED_MEATS);

          if(indexes.length < REQUIRED_MEATS) return 'You do not have enough bear meat for that!';
          NPCLoader.takeItemsFromPlayerSack(player, indexes);
        }

        NPCLoader.takePlayerItem(player, BEAR_MEAT, 'left');
        NPCLoader.takePlayerItem(player, 'Mend Bottle', 'right');

        NPCLoader.loadItem('Bear Meat Antidote')
          .then(item => {
            item.ounces = REQUIRED_MEATS;
            player.setRightHand(item);
          });

        return `Thanks, ${player.name}! There's a bottle of antidote for ya. And thanks for the meat, heheh.`;
      }

      return `Hold one meat in your left hand, and hold a small healing bottle from town in your right. I'll take as many bear meat as there are ounces in the bottle and give you an antidote made with bear meat!`;
    });
};
