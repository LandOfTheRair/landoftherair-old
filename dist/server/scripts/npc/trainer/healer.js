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
const npc_loader_1 = require("../../../helpers/npc-loader");
const common_responses_1 = require("../common-responses");
const character_1 = require("../../../../models/character");
const learnedSkills = { Restoration: {
        1: ['Cure'],
        2: ['Afflict'],
        3: ['TrueSight'],
        4: ['Antidote'],
        5: ['Poison'],
        6: ['BarNecro'],
        7: ['Revive']
    } };
exports.setup = (npc) => __awaiter(this, void 0, void 0, function* () {
    npc.hostility = 'Never';
    npc.gear.Armor = yield npc_loader_1.NPCLoader.loadItem('Antanian Studded Tunic');
    npc.rightHand = yield npc_loader_1.NPCLoader.loadItem('Antanian Staff');
    npc.classTrain = 'Healer';
    npc.trainSkills = [character_1.SkillClassNames.Restoration, character_1.SkillClassNames.Mace, character_1.SkillClassNames.Staff];
    npc.recalculateStats();
});
exports.responses = (npc) => {
    common_responses_1.BaseClassTrainerResponses(npc, learnedSkills);
    common_responses_1.RecallerResponses(npc);
};
//# sourceMappingURL=healer.js.map