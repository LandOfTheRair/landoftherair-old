import { NPC } from '../../../../../shared/models/npc';
import { NPCLoader } from '../../../../helpers/npc-loader';
import { DarkVision } from '../../../../effects/DarkVision';

import { includes } from 'lodash';

const SEWERRAT_FUR = 'Yzalt SewerRat Fur';
const STRAW_ROBE = 'Yzalt Straw Robe';
const RATGUARD_AXE = 'Yzalt RatGuard Axe';
const FUNGUS_CLOAK = 'Yzalt Fungus Cloak';
const RATGUARD_FUR = 'Yzalt RatGuard Fur';

const allItems = [
  SEWERRAT_FUR,
  STRAW_ROBE,
  RATGUARD_AXE,
  FUNGUS_CLOAK,
  RATGUARD_FUR
];

const yzaltSewerRatFur = (player) => {
  if(!NPCLoader.checkPlayerHeldItem(player, SEWERRAT_FUR, 'right')) return 'That fur does not belong to you.';

  if(player.rightHand.stats.armorClass > 7) return 'You have already improved that fur!';

  if(NPCLoader.checkPlayerHeldItemBothHands(player, SEWERRAT_FUR)) {
    NPCLoader.takePlayerItem(player, SEWERRAT_FUR, 'left');

    player.rightHand.stats.armorClass += 3;
    player.rightHand.stats.fireResist += 10;
    player.rightHand.stats.iceResist += 10;

    return 'Nice find. I\'ve added some defense to your rat fur!';
  }

  return 'Hmmm. This is plain sewer rat fur. If you bring me a second one, I can add the defense from one to the other.';
};

const yzaltStrawRobe = (player) => {
  if(!NPCLoader.checkPlayerHeldItem(player, STRAW_ROBE, 'right')) return 'That robe does not belong to you.';

  if(player.rightHand.stats.armorClass > 2) return 'You have already improved that robe!';

  if(NPCLoader.checkPlayerHeldItemBothHands(player, STRAW_ROBE)) {
    NPCLoader.takePlayerItem(player, STRAW_ROBE, 'left');

    player.rightHand.stats.armorClass += 1;
    player.rightHand.stats.iceResist += 20;
    player.rightHand.stats.defense += 1;

    return 'Great job! I\'ve merged the straw from the two robes, here is what I came up with.';
  }

  return 'Interesting! They make robes out of the straw they use to make their nests, too. I can combine the straw from two of them to make a stronger robe.';
};

const yzaltRatGuardAxe = (player) => {
  if(!NPCLoader.checkPlayerHeldItem(player, RATGUARD_AXE, 'right')) return 'That axe does not belong to you.';

  if(player.rightHand.minDamage > 5) return 'You have already improved that axe!';

  if(NPCLoader.checkPlayerHeldItemBothHands(player, RATGUARD_AXE)) {
    NPCLoader.takePlayerItem(player, RATGUARD_AXE, 'left');

    player.rightHand.minDamage += 5;
    player.rightHand.maxDamage += 5;

    return 'Well, I\'m not sure how much I was able to do, but here it is: a slightly sharper axe.';
  }

  return 'So they can use axes, too? They might be too dangerous to be left alone. I can sharpen one with the other to increase its damage output.';
};

const yzaltFungusCloak = (player) => {
  if(!NPCLoader.checkPlayerHeldItem(player, FUNGUS_CLOAK, 'right')) return 'That cloak does not belong to you.';

  if(player.rightHand.stats.armorClass > 2) return 'You have already improved that cloak!';

  if(NPCLoader.checkPlayerHeldItemBothHands(player, FUNGUS_CLOAK)) {
    NPCLoader.takePlayerItem(player, FUNGUS_CLOAK, 'left');

    player.rightHand.stats.armorClass += 1;
    player.rightHand.stats.defense += 1;
    player.rightHand.stats.stealth += 1;

    return 'It doesn\'t smell the best, but it\'ll get the job done.';
  }

  return 'Well, this robe stinks like a rat. And fungus. These rats really couldn\'t make something that smells nicer? Bring me another one and I\'ll... see what I can do...';
};

const yzaltRatGuardFur = (player) => {
  if(!NPCLoader.checkPlayerHeldItem(player, RATGUARD_FUR, 'right')) return 'That fur does not belong to you.';

  if(player.rightHand.stats.armorClass > 10) return 'You have already improved that fur!';

  if(NPCLoader.checkPlayerHeldItemBothHands(player, RATGUARD_FUR)) {
    NPCLoader.takePlayerItem(player, RATGUARD_FUR, 'left');

    player.rightHand.stats.armorClass += 5;
    player.rightHand.stats.fireResist += 20;
    player.rightHand.stats.iceResist += 20;

    return 'Very nice find. I\'ve added some defense to your rat fur!';
  }

  return 'This fur feels stronger than the average rat fur. Can you bring me another one?';
};


const itemFuncs = {
  [SEWERRAT_FUR]: yzaltSewerRatFur,
  [STRAW_ROBE]:   yzaltStrawRobe,
  [RATGUARD_AXE]: yzaltRatGuardAxe,
  [FUNGUS_CLOAK]: yzaltFungusCloak,
  [RATGUARD_FUR]: yzaltRatGuardFur
};

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';

  npc.gear.Armor = await NPCLoader.loadItem('Antanian Tunic');
  npc.recalculateStats();
};

export const responses = (npc: NPC) => {

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {

      if(player.rightHand && includes(allItems, player.rightHand.name)) {
        return itemFuncs[player.rightHand.name](player);
      }

      const dv = new DarkVision({});
      dv.duration = 3600;
      dv.cast(player, player);

      return `Well hello there! If you're in the market for some dungeon diving, I can help you out with the gift of darkvision. Come back anytime! If you find anything interesting regarding the rat civilization, I want to be the first to know!`;
    });

};
