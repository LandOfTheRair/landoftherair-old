"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const character_1 = require("../../models/character");
const Command_1 = require("./Command");
const item_creator_1 = require("../helpers/item-creator");
const lodash_1 = require("lodash");
class Skill extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.requiresLearn = true;
        this.mpCost = (caster) => 0;
        this.hpCost = (caster) => 0;
        this.range = (caster) => 0;
    }
    canUse(user, target) {
        if (user.mp.lessThan(this.mpCost(user)))
            return false;
        if (user.hp.lessThan(this.hpCost(user)))
            return false;
        if (user.distFrom(target) > this.range(user))
            return false;
        return true;
    }
    tryToConsumeMP(user, effect) {
        if (effect)
            return true;
        const mpCost = this.mpCost();
        if (user.baseClass === 'Thief') {
            if (user.hp.getValue() < mpCost) {
                user.sendClientMessage('You do not have enough HP!');
                return false;
            }
        }
        else if (user.mp.getValue() < mpCost) {
            user.sendClientMessage('You do not have enough MP!');
            return false;
        }
        if (user.baseClass === 'Thief') {
            user.hp.sub(mpCost);
        }
        else if (mpCost > 0) {
            user.mp.sub(mpCost);
        }
        return true;
    }
    getTarget(user, args, allowSelf = false) {
        let target = null;
        if (allowSelf) {
            target = user;
        }
        if (args) {
            const possTargets = user.$$room.getPossibleMessageTargets(user, args);
            target = possTargets[0];
        }
        if (!target) {
            user.sendClientMessage('You do not see that person.');
            return null;
        }
        const range = this.range();
        if (target.distFrom(user) > range) {
            user.sendClientMessage('That target is too far away!');
            return null;
        }
        return target;
    }
    facilitateSteal(user, target) {
        return __awaiter(this, void 0, void 0, function* () {
            if (target.sack.allItems.length === 0 && target.gold <= 0)
                return user.sendClientMessage('You can\'t seem to find anything to take!');
            const gainThiefSkill = (gainer, skillGained) => {
                if (skillGained <= 0)
                    return;
                gainer.gainSkill(character_1.SkillClassNames.Thievery, skillGained);
            };
            const mySkill = user.calcSkillLevel(character_1.SkillClassNames.Thievery) * (user.baseClass === 'Thief' ? 3 : 1.5);
            const myStealth = Math.max(target.getTotalStat('stealth'), user.stealthLevel());
            const yourPerception = target.getTotalStat('perception');
            const baseStealRoll = (myStealth / yourPerception) * 100;
            const stealRoll = lodash_1.random(baseStealRoll - 10, baseStealRoll + 10);
            if (target.gold > 0) {
                if (lodash_1.random(0, stealRoll) < 30) {
                    gainThiefSkill(user, 1);
                    return user.sendClientMessage({ message: 'Your stealing attempt was thwarted!', target: target.uuid });
                }
                const fuzzedSkill = lodash_1.random(Math.max(mySkill - 3, 1), mySkill + 5);
                const stolenGold = Math.max(1, Math.min(target.gold, mySkill * 100, Math.max(5, Math.floor(target.gold * (fuzzedSkill / 100)))));
                target.gold -= stolenGold;
                const item = yield item_creator_1.ItemCreator.getGold(stolenGold);
                const handName = this.getEmptyHand(user);
                user[`set${handName}`](item);
                user.sendClientMessage({ message: `You stole ${stolenGold} gold from ${target.name}!`, target: target.uuid });
            }
            else if (target.sack.allItems.length > 0) {
                if (lodash_1.random(0, stealRoll) < 60) {
                    gainThiefSkill(user, 1);
                    return user.sendClientMessage({ message: 'Your stealing attempt was thwarted!', target: target.uuid });
                }
                const item = target.sack.randomItem();
                target.sack.takeItem(item);
                const handName = this.getEmptyHand(user);
                user[`set${handName}`](item);
                user.sendClientMessage({ message: `You stole a ${item.itemClass.toLowerCase()} from ${target.name}!`, target: target.uuid });
            }
            const skillGained = baseStealRoll > 100 ? 1 : Math.floor((100 - baseStealRoll) / 5);
            gainThiefSkill(user, skillGained);
        });
    }
}
exports.Skill = Skill;
//# sourceMappingURL=Skill.js.map