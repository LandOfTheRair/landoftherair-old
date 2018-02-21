
import { NPC } from '../../../shared/models/npc';
import { includes, capitalize, sample, get, random } from 'lodash';
import { Logger } from '../../logger';
import { AllNormalGearSlots, SkillClassNames } from '../../../shared/models/character';
import { Item } from '../../../shared/models/item';
import { NPCLoader } from '../../helpers/npc-loader';
import { Revive } from '../../effects/cures/Revive';
import { LearnAlchemy } from '../../quests/antania/Rylt/LearnAlchemy';
import { SkillHelper } from '../../helpers/skill-helper';

export const TannerResponses = (npc: NPC) => {
  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      return `Greetings, ${player.name}, and welcome to my Tannery. Bring me your kills, and I will TAN them for you!`;
    });

  npc.parser.addCommand('tan')
    .set('syntax', ['tan'])
    .set('logic', (args, { player }) => {

      const ground = npc.$$room.state.getGroundItems(npc.x, npc.y);
      if(!ground.Corpse || !ground.Corpse.length) return 'There are no corpses here!';

      let errMessage = '';

      ground.Corpse.forEach(corpse => {
        if(corpse.$$isPlayerCorpse) return;

        if(!includes(corpse.$$playersHeardDeath, player.username)) {
          errMessage = 'You didn\'t have a hand in killing that!';
          return;
        }

        const corpseNPC = npc.$$room.state.findNPC(corpse.npcUUID);
        if(corpseNPC) corpseNPC.restore();
        else          npc.$$room.removeItemFromGround(corpse);

        if(!corpse.tansFor) return;

        NPCLoader.loadItem(corpse.tansFor)
          .then(item => {
            item.setOwner(player);
            npc.$$room.addItemToGround(npc, item);
          });
      });

      if(errMessage) return errMessage;

      return `Here you go, ${player.name}!`;
    });
};

export const PeddlerResponses = (npc: NPC) => {

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(!npc.peddleItem || !npc.peddleCost) {
        Logger.error(new Error(`Peddler at ${npc.x}, ${npc.y} - ${npc.map} does not have a valid peddleItem/peddleCost`));
        return;
      }

      if(npc.distFrom(player) > 2) return 'Please move closer.';

      return `Hello, ${player.name}! I can sell you a fancy ${npc.peddleItem} for ${npc.peddleCost.toLocaleString()} gold. Just tell me you want to BUY it!`;
    });

  npc.parser.addCommand('buy')
    .set('syntax', ['buy'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 2) return 'Please move closer.';

      if(player.rightHand) return 'Please empty your right hand!';

      if(player.gold < npc.peddleCost) return `I can't offer this for free. You need ${npc.peddleCost.toLocaleString()} gold for a ${npc.peddleItem}.`;

      player.loseGold(npc.peddleCost);

      const item = new Item(npc.rightHand);
      item.regenerateUUID();

      player.setRightHand(item);

      return `Thank you, ${player.name}!`;
    });
};

export const SmithResponses = (npc: NPC) => {

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(!npc.costPerThousand || !npc.repairsUpToCondition) {
        Logger.error(new Error(`Smith at ${npc.x}, ${npc.y} - ${npc.map} does not have a valid costPerThousand/repairsUpToCondition`));
        return;
      }

      if(npc.distFrom(player) > 2) return 'Please move closer.';

      if(player.rightHand) {
        const maxCondition = player.$$room.subscriptionHelper.calcMaxSmithRepair(player, npc.repairsUpToCondition || 20000);

        const cpt = npc.costPerThousand || 1;

        const missingCondition = maxCondition - player.rightHand.condition;
        if(missingCondition < 0) return 'That item is already beyond my capabilities!';

        const cost = Math.floor(missingCondition / 1000 * cpt);

        if(cost === 0) return 'That item is not in need of repair!';
        if(player.gold < cost) return `You need ${cost.toLocaleString()} gold to repair that item.`;

        player.loseGold(cost);
        player.rightHand.condition = maxCondition;
        return `Thank you, ${player.name}! I've repaired your item for ${cost.toLocaleString()} gold.`;
      }

      return `Hello, ${player.name}! 
      I am a Smith. I can repair your weapons and armor - just hold them in your right hand! 
      Or, you can tell me REPAIRALL and I will repair what you're holding and what you're wearing.`;
    });

  npc.parser.addCommand('repairall')
    .set('syntax', ['repairall'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 2) return 'Please move closer.';

      const maxCondition = player.$$room.subscriptionHelper.calcMaxSmithRepair(player, npc.repairsUpToCondition || 20000);
      const cpt = npc.costPerThousand || 1;

      let totalCosts = 0;

      AllNormalGearSlots.forEach(slot => {
        const item = get(player, slot);
        if(!item || item.condition > maxCondition) return;

        const cost = Math.floor((maxCondition - item.condition) / 1000 * cpt);
        if(cost === 0 || cost > player.gold) return;

        totalCosts += cost;

        player.loseGold(cost);
        item.condition = maxCondition;
      });

      if(totalCosts === 0) {
        return `You are not wearing any items in need of repair.`;
      }

      return `Thank you, ${player.name}! I've done what I can. You've spent ${totalCosts.toLocaleString()} gold.`;
    });

};

export const RandomlyShouts = (npc: NPC, responses: string[] = [], opts: any = { combatOnly: false }) => {
  let ticks = 0;
  let nextTick = random(15, 30);

  npc.$$ai.tick.add(() => {
    ticks++;

    if(opts.combatOnly && npc.combatTicks <= 0) return;

    if(ticks >= nextTick) {
      nextTick = random(5, 10);
      ticks = 0;

      let response = sample(responses);

      if(responses.length > 1 && response === npc.$$lastResponse) {
        do {
          response = sample(responses);
        } while(response === npc.$$lastResponse);
      }

      npc.$$lastResponse = response;

      const msgObject = { name: npc.name, message: response, subClass: 'chatter' };
      npc.sendClientMessageToRadius(msgObject, 8);
    }
  });
};

export const CrierResponses = (npc: NPC) => {
  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      return `Hello, ${player.name}! I am the Crier, and my voice is the voice of the people!`;
    });
};

export const RecallerResponses = (npc: NPC) => {
  npc.parser.addCommand('recall')
    .set('syntax', ['recall'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 2) return 'Please move closer.';

      player.respawnPoint = { map: npc.$$room.state.mapName, x: npc.x, y: npc.y };
      return `I will recall you here when you die, ${player.name}. Safe travels.`;
    });
};

export const AlchemistResponses = (npc: NPC) => {

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(!npc.alchCost || !npc.alchOz) {
        Logger.error(new Error(`Alchemist at ${npc.x}, ${npc.y} - ${npc.map} does not have a valid alchCost/alchOz!`));
        return;
      }

      let lastLine = 'You can also tell me ALCHEMY to practice on your own and I can ASSESS your progress!';

      const isQuestComplete = player.hasPermanentCompletionFor('LearnAlchemy');

      if(player.hasQuest(LearnAlchemy) && !isQuestComplete) {

        if(NPCLoader.checkPlayerHeldItemEitherHand(player, 'Antanian Fungus Bread')) {
          LearnAlchemy.updateProgress(player);
        }

        if(LearnAlchemy.isComplete(player)) {
          LearnAlchemy.completeFor(player);

          return 'Congratulations! You\'re now a budding alchemist. Go forth and find some new recipes!';
        }

        return LearnAlchemy.incompleteText(player);

      } else if(!isQuestComplete) {
        lastLine = 'If you would like, you can LEARN how to do Alchemy from me!';

      }

      const maxOz = player.$$room.subscriptionHelper.calcPotionMaxSize(player, npc.alchOz);

      if(npc.distFrom(player) > 2) return 'Please move closer.';
      return `Hello, ${player.name}! 
      You can tell me COMBINE while holding a bottle in your right hand to 
      mix together that with other bottles of the same type in your sack. 
      I can combine up to ${maxOz}oz into one bottle. It will cost ${npc.alchCost} gold per ounce to do this.
      ${lastLine}`;
    });

  npc.parser.addCommand('combine')
    .set('syntax', ['combine'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 2) return 'Please move closer.';

      const maxOz = player.$$room.subscriptionHelper.calcPotionMaxSize(player, npc.alchOz);

      const item = player.rightHand;
      if(!item || item.itemClass !== 'Bottle') return 'You are not holding a bottle.';
      if(item.ounces >= maxOz) return 'That bottle is already too full for me.';

      let itemsRemoved = 0;

      const indexes = [];

      player.sack.items.forEach((checkItem, i) => {
        if(!checkItem.effect) return;
        if(checkItem.effect.name !== item.effect.name) return;
        if(checkItem.effect.potency !== item.effect.potency) return;
        if(checkItem.ounces + item.ounces > maxOz) return;

        const cost = checkItem.ounces * npc.alchCost;
        if(npc.alchCost > cost) return;

        player.loseGold(cost);
        indexes.push(i);
        item.ounces += checkItem.ounces;
        itemsRemoved++;
      });

      NPCLoader.takeItemsFromPlayerSack(player, indexes);

      if(itemsRemoved === 0) return 'I was not able to combine any bottles.';

      item.setOwner(player);

      return `I've taken ${itemsRemoved} bottles from your sack and combined them with the item in your hand. Enjoy!`;
    });

  npc.parser.addCommand('alchemy')
    .set('syntax', ['alchemy'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';
      npc.$$room.showAlchemyWindow(player, npc);
    });

  npc.parser.addCommand('learn')
    .set('syntax', ['learn'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';

      if(player.hasPermanentCompletionFor('LearnAlchemy')) return 'I have already taught you the way of the bottle!';

      player.startQuest(LearnAlchemy);

      return 'Great! I love teaching new alchemists. To start, go get a bottle of water and bread. Come back, and tell me you want to practice ALCHEMY. Then, just mix the two items together!';
    });

  npc.parser.addCommand('assess')
    .set('syntax', ['assess'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';

      const assessCost = 50;
      if(player.gold < assessCost) return `I require ${assessCost.toLocaleString()} gold for my assessment.`;

      player.loseGold(assessCost);

      const percentWay = SkillHelper.assess(player, SkillClassNames.Alchemy);
      return `You are ${percentWay}% on your way towards the next level of ${SkillClassNames.Alchemy.toUpperCase()} proficiency.`;
    });
};

export const BankResponses = (npc: NPC) => {
  if(!npc.bankId || !npc.branchId) {
    Logger.error(new Error(`Banker at ${npc.x}, ${npc.y} - ${npc.map} does not have a valid bank/branch id`));
    return;
  }

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 2) return 'Please move closer.';
      player.$$room.openBank(player, npc);
      return `Greetings ${player.name}! Welcome to the ${npc.bankId} National Bank, ${npc.branchId} branch. You can WITHDRAW or DEPOSIT your coins here!`;
    });

  npc.parser.addCommand('deposit')
    .set('syntax', ['deposit <string:amount>'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 2) return 'Please move closer.';

      const amount = +args.amount;
      const region = npc.bankId;
      const res = player.$$room.depositBankMoney(player, region, amount);
      if(res === false) return 'That amount of gold is not valid.';
      if(res === 0) return 'What, do you think you\'re funny? Get out of line, there are other people to service!';
      return `Thank you, you have deposited ${res.toLocaleString()} gold into the ${region} National Bank. Your new balance is ${player.$$banks[region].toLocaleString()} gold.`;
    });

  npc.parser.addCommand('withdraw')
    .set('syntax', ['withdraw <string:amount>'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 2) return 'Please move closer.';

      const amount = +args.amount;
      const region = npc.bankId;
      const res = player.$$room.withdrawBankMoney(player, region, amount);
      if(res === false) return 'That amount of gold is not valid.';
      if(res === 0) return 'Hey, do I look like a charity to you? Get lost!';
      return `Thank you, you have withdrawn ${res.toLocaleString()} gold into the ${region} National Bank. Your new balance is ${player.$$banks[region].toLocaleString()} gold.`;
    });
};

export const VendorResponses = (npc: NPC, { classRestriction = '' } = {}) => {

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(npc.vendorItems.length === 0) {
        Logger.error(new Error(`Vendor at ${npc.x}, ${npc.y} - ${npc.map} does not have any vendorItems!`));
        return;
      }

      if(npc.allegiance !== 'None') {
        if(player.isHostileTo(npc.allegiance)) return 'I have nothing to say to your kind.';
      }

      if(classRestriction && player.baseClass !== classRestriction) {
        return 'I have nothing to say to you.';
      }

      if(npc.distFrom(player) > 2) return 'Please move closer.';
      npc.$$room.showShopWindow(player, npc);
      return `Greetings ${player.name}! Please view my wares.`;
    });

  npc.parser.addCommand('appraise')
    .set('syntax', ['appraise'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 2) return 'Please move closer.';

      if(npc.allegiance !== 'None') {
        if(player.isHostileTo(npc.allegiance)) return 'I have nothing to say to your kind.';
      }

      if(!player.rightHand) return 'I cannot give you as value for your hand.';

      const value = player.rightHand.value;
      if(value === 0) return 'That item is worthless.';

      return `That item is worth about ${value.toLocaleString()} coins, but I'd only buy it for ${player.sellValue(player.rightHand).toLocaleString()} coins.`;
    });

  npc.parser.addCommand('sell')
    .set('syntax', ['sell <string:itemtype*>'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 2) return 'Please move closer.';
      const itemtype = args['itemtype*'].toLowerCase();

      if(npc.allegiance !== 'None') {
        if(player.isHostileTo(npc.allegiance)) return 'I have nothing to say to your kind.';
      }

      // sell all items matching item type (player.sellItem)

      let sellValue = 0;

      const allItems = player.sack.allItems.filter((item, i) => {
        if(item.itemClass.toLowerCase() !== itemtype) return false;

        const itemValue = player.sellValue(item);
        if(itemValue <= 0) return false;

        sellValue += itemValue;

        return true;
      });

      if(allItems.length === 0) return 'You are not carrying any items of that type!';

      allItems.forEach(item => {
        player.sellItem(item);
        player.sack.takeItem(item);
      });

      return `You sold me ${allItems.length} items for a grand total of ${sellValue.toLocaleString()} gold. Thank you!`;
    });

};

export const EncrusterResponses = (npc: NPC) => {

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';
      return `Hail, ${player.name}! I am the Encruster, and I can put magical gems into your weapons and armor. 
      You can only set one gem at a time, and subsequent encrusts will replace the old gem.
      It will cost a fair price - the value of the gem, some insurance for the item, and then a little bit for me.
      If you would like to do this, hold the item in your right hand, the gem in your left, and tell me ENCRUST.
      Beware - encrusting an item will bind it to you!`;
    });

  npc.parser.addCommand('encrust')
    .set('syntax', ['encrust'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';

      if(!player.rightHand) return 'You must hold an item in your right hand!';
      if(player.rightHand.itemClass === 'Corpse') return 'That would be disrespectful.';
      if(!player.rightHand.isOwnedBy(player)) return 'That item does not belong to you!';
      if(!player.leftHand || player.leftHand.itemClass !== 'Gem') return 'You must hold a gem in your left hand!';
      if(!player.leftHand.isOwnedBy(player)) return 'That gem does not belong to you!';
      if(!player.leftHand.canUseInCombat(player)) return 'You cannot use that gem!';

      const cost = player.leftHand.value + player.rightHand.value + 500;

      if(player.gold < cost) return `I require ${cost.toLocaleString()} gold for this transaction.`;

      const prevEncrust = player.rightHand.encrust;

      const nextEncrust = {
        desc: player.leftHand.desc,
        stats: player.leftHand.stats,
        sprite: player.leftHand.sprite,
        value: player.leftHand.value
      };

      const prevValue = get(prevEncrust, 'value', 0);
      player.rightHand.value -= prevValue;
      player.rightHand.value += nextEncrust.value;

      player.loseGold(cost);
      player.setLeftHand(null);
      player.rightHand.setOwner(player);

      player.rightHand.encrust = nextEncrust;
      const replaceText = prevEncrust ? ` This has replaced your ${prevEncrust.desc}.` : '';
      player.recalculateStats();

      return `I have set your ${player.rightHand.itemClass.toLowerCase()} with ${nextEncrust.desc}.${replaceText}`;
    });
};

export const BaseClassTrainerResponses = (npc: NPC, skills?: any) => {

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(!npc.maxSkillTrain || !npc.trainSkills || !npc.classTrain || !npc.maxLevelUpLevel) {
        Logger.error(new Error(`Trainer at ${npc.x}, ${npc.y} - ${npc.map} does not have a valid maxSkillTrain/trainSkills/classTrain/maxLevelUpLevel`));
        return;
      }

      if(npc.distFrom(player) > 0) return 'Please move closer.';
      npc.$$room.showTrainerWindow(player, npc);
      return `Hail, ${player.name}! 
      If you want to try to level up, TRAIN with me. 
      Alternatively, I can let you know how your combat skills are progressing if you want to ASSESS them! 
      You can also JOIN the ${npc.classTrain} profession if you haven't chosen one already!`;
    });

  npc.parser.addCommand('assess')
    .set('syntax', ['assess <string:skill*>'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';

      const skill = args['skill*'].toLowerCase();

      if(!includes(npc.trainSkills, capitalize(skill))) return 'I cannot teach you anything about this.';

      const skillLevel = player.calcSkillLevel(skill);

      const maxAssessSkill = npc.maxSkillTrain;

      const assessCost = maxAssessSkill * 10;
      if(player.gold < assessCost) return `I require ${assessCost.toLocaleString()} gold for my assessment.`;

      player.loseGold(assessCost);

      if(skillLevel >= maxAssessSkill) return 'You are too advanced for my teachings.';

      const percentWay = SkillHelper.assess(player, skill);
      return `You are ${percentWay}% on your way towards the next level of ${skill.toUpperCase()} proficiency.`;
    });

  npc.parser.addCommand('train')
    .set('syntax', ['train'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';
      if(player.baseClass !== npc.classTrain) return 'I have nothing to teach you.';

      const level = player.level;

      const trainCost = npc.maxLevelUpLevel * 50;
      if(player.gold < trainCost) return `I require ${trainCost} gold for my training.`;

      if(level >= npc.maxLevelUpLevel) return 'You are too advanced for my teachings.';

      player.tryLevelUp(npc.maxLevelUpLevel);
      const newLevel = player.level;

      if(newLevel === level) return 'You are not experienced enough to train with me.';

      player.loseGold(trainCost);

      return `You have gained ${newLevel - level} experience level.`;
    });

  npc.parser.addCommand('join')
    .set('syntax', ['join'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';
      if(player.baseClass !== 'Undecided') return 'You have already joined a profession.';

      player.changeBaseClass(npc.classTrain);

      return `Welcome to the ${npc.classTrain} profession, ${player.name}!`;
    });

  npc.parser.addCommand('learn')
    .set('syntax', ['learn'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';
      if(player.baseClass !== npc.classTrain) return 'I have nothing to teach you.';

      if(!skills) return 'I have no skills to teach you.';

      const learnCost = npc.maxSkillTrain * 100;
      if(player.gold < learnCost) return `I require ${learnCost} gold for my teaching.`;

      const learnedSkills = [];

      Object.keys(skills).forEach(skillName => {
        Object.keys(skills[skillName]).forEach(spellLevel => {
          if(player.calcSkillLevel(skillName) < +spellLevel) return;
          skills[skillName][spellLevel].forEach(spellName => {
            if(!player.learnSpell(spellName)) return;
            learnedSkills.push(spellName);
          });
        });
      });

      if(learnedSkills.length === 0) return 'I cannot currently teach you anything new.';

      player.$$room.resetMacros(player);
      player.loseGold(learnCost);

      return `You have learned the abilities: ${learnedSkills.join(', ')}.`;
    });
};

export const ReviverResponses = (npc: NPC) => {

  npc.parser.addCommand('revive')
    .set('syntax', ['revive'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';


      const targets = npc.$$room.state.getPlayersInRange(npc, 0, [npc.uuid]).filter(target => target.isDead());
      const target = targets[0];

      if(!target) return 'There is no one in need of revival here!';

      const resSpell = new Revive({});
      resSpell.cast(npc, target);
      return `Done!`;
    });
};

export const DiplomatResponses = (npc: NPC) => {
  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      const factions = ['Pirates', 'Townsfolk', 'Royalty', 'Adventurers', 'Wilderness', 'Underground'];

      const factionStrings = factions.map(faction => {
        return `The ${faction} regards you as ${player.allegianceAlignmentString(faction)}. (${player.allegianceReputation[faction] || 0})`;
      });

      return [`Greetings, ${player.name}! I can sense your social standings with the various factions of the land:`].concat(factionStrings).join('|||');
    });
};

export const SpellforgingResponses = (npc: NPC) => {
  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';
      if(player.calcSkillLevel('Conjuration') < 1) return 'You are not skilled enough to Spellforge.';
      npc.$$room.showSpellforgingWindow(player, npc);

      return 'Greetings, fellow conjurer. I am a master enchanter who can help you learn the higher conjuration arts and ASSESS your progress.';
    });

  npc.parser.addCommand('assess')
    .set('syntax', ['assess'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';

      const assessCost = 50;
      if(player.gold < assessCost) return `I require ${assessCost.toLocaleString()} gold for my assessment.`;

      player.loseGold(assessCost);

      const percentWay = SkillHelper.assess(player, SkillClassNames.Spellforging);
      return `You are ${percentWay}% on your way towards the next level of ${SkillClassNames.Spellforging.toUpperCase()} proficiency.`;
    });
};


const calcRequiredGoldForNextHPMP = (player, maxForTier: number, normalizer: number, costsAtTier: { min, max }) => {

  const normal = normalizer;

  const curHp = player.getBaseStat('hp');

  // every cha past 7 is +1% discount
  const discountPercent = Math.min(50, player.getTotalStat('cha') - 7);
  const percentThere = Math.max(0.01, (curHp - normal) / (maxForTier - normal));

  const { min, max } = costsAtTier;

  const totalCost = min + ((max - min) * percentThere);
  const totalDiscount = (totalCost * discountPercent / 100);

  return player.$$room.subscriptionHelper.modifyDocPrice(player, Math.max(min, Math.round(totalCost - totalDiscount)));
};

export const HPDocResponses = (npc: NPC) => {

  if(!npc.hpTier) {
    Logger.error(new Error(`HPDoc at ${npc.x}, ${npc.y} - ${npc.map} does not have a valid hpTier`));
    return;
  }

  const hpTiers = {
    Mage:       [100, 375, 600],
    Thief:      [100, 425, 700],
    Healer:     [100, 400, 650],
    Warrior:    [100, 450, 800],
    Undecided:  [100, 200, 300]
  };

  const levelTiers = [0, 13, 25];

  const hpNormalizers = [100, 200, 300];

  const hpCosts = [
    { min: 100,     max: 500 },
    { min: 5000,    max: 15000 },
    { min: 100000,  max: 1000000 }
  ];

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Closer move.';

      return `${player.name}, greet! Am exiled scientist of Rys descent. Taught forbidden arts of increase life force. Interest? Hold gold, say TEACH.`;
    });

  npc.parser.addCommand('teach')
    .set('syntax', ['teach'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Closer move.';

      const levelTier = levelTiers[npc.hpTier];
      if(player.level < levelTier) return 'Not experience enough for teach!';

      const playerBaseHp = player.getBaseStat('hp');
      const maxHpForTier = hpTiers[player.baseClass][npc.hpTier];

      if(playerBaseHp > maxHpForTier) return 'Too powerful! No help!';
      if(!NPCLoader.checkPlayerHeldItem(player, 'Gold Coin', 'right')) return 'No gold! No help!';

      let cost = calcRequiredGoldForNextHPMP(player, maxHpForTier, hpNormalizers[npc.hpTier], hpCosts[npc.hpTier]);
      let totalHPGained = 0;
      let totalAvailable = player.rightHand.value;
      let totalCost = 0;

      if(cost > totalAvailable) return `Need ${cost.toLocaleString()} gold for life force!`;

      while(cost > 0 && cost <= totalAvailable) {
        totalAvailable -= cost;
        totalCost += cost;
        totalHPGained++;
        player.gainBaseStat('hp', 1);

        if(player.getBaseStat('hp') >= maxHpForTier) {
          cost = -1;
        } else {
          cost = calcRequiredGoldForNextHPMP(player, maxHpForTier, hpNormalizers[npc.hpTier], hpCosts[npc.hpTier]);
        }
      }

      if(totalAvailable === 0) {
        totalAvailable = 1;
        totalCost -= 1;
      }

      player.rightHand.value = totalAvailable;

      return `Gained ${totalHPGained} life forces! Cost ${totalCost.toLocaleString()} gold!`;
    });
};

export const MPDocResponses = (npc: NPC) => {

  if(!npc.mpTier) {
    Logger.error(new Error(`MPDoc at ${npc.x}, ${npc.y} - ${npc.map} does not have a valid mpTier`));
    return;
  }

  const mpTiers = {
    Mage:       [0, 0, 1000],
    Thief:      [0, 0, 0],
    Healer:     [0, 0, 900],
    Warrior:    [0, 0, 0],
    Undecided:  [0, 0, 0]
  };

  const levelTiers = [0, 13, 25];

  const mpNormalizers = [100, 200, 300];

  const mpCosts = [
    { min: 100,     max: 500 },
    { min: 25000,   max: 45000 },
    { min: 500000,  max: 5000000 }
  ];

  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Closer move.';

      return `${player.name}, greet! Am exiled scientist of Rys descent. Taught forbidden arts of increase magic force. Interest? Hold gold, say TEACH.`;
    });

  npc.parser.addCommand('teach')
    .set('syntax', ['teach'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Closer move.';

      const levelTier = levelTiers[npc.mpTier];
      if(player.level < levelTier) return 'Not experience enough for teach!';

      const playerBaseMp = player.getBaseStat('mp');
      const maxMpForTier = mpTiers[player.baseClass][npc.mpTier];

      if(playerBaseMp > maxMpForTier) return 'Too powerful! No help!';
      if(!NPCLoader.checkPlayerHeldItem(player, 'Gold Coin', 'right')) return 'No gold! No help!';

      let cost = calcRequiredGoldForNextHPMP(player, maxMpForTier, mpNormalizers[npc.mpTier], mpCosts[npc.mpTier]);
      let totalMPGained = 0;
      let totalAvailable = player.rightHand.value;
      let totalCost = 0;

      if(cost > totalAvailable) return `Need ${cost.toLocaleString()} gold for magic force!`;

      while(cost > 0 && cost <= totalAvailable) {
        totalAvailable -= cost;
        totalCost += cost;
        totalMPGained++;
        player.gainBaseStat('mp', 1);

        if(player.getBaseStat('mp') >= maxMpForTier) {
          cost = -1;
        } else {
          cost = calcRequiredGoldForNextHPMP(player, maxMpForTier, mpNormalizers[npc.mpTier], mpCosts[npc.mpTier]);
        }
      }

      if(totalAvailable === 0) {
        totalAvailable = 1;
        totalCost -= 1;
      }

      player.rightHand.value = totalAvailable;

      return `Gained ${totalMPGained} magic forces! Cost ${totalCost.toLocaleString()} gold!`;
    });
};
