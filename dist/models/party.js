"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
class PartyPlayer {
    constructor(player) {
        this.name = player.name;
        this.username = player.username;
        this.baseClass = player.baseClass;
        // these can change
        this.level = player.level;
        this.hpPercent = player.hp.asPercent();
        this.mpPercent = player.mp.asPercent();
        this.map = player.map;
        this.x = player.x;
        this.y = player.y;
    }
}
exports.PartyPlayer = PartyPlayer;
class Party {
    constructor(leader, partyName) {
        this.partyName = partyName;
        this.members = [];
        this.members = [leader];
    }
    get name() {
        return this.partyName;
    }
    get leader() {
        return this.members[0];
    }
    get canBeDeleted() {
        return this.members.length === 0;
    }
    get averageLevel() {
        return Math.floor(lodash_1.sumBy(this.members, 'level') / this.members.length);
    }
    get allMembers() {
        return this.members;
    }
    isLeader(username) {
        return this.leader.username === username;
    }
    findMemberByUsername(username) {
        return lodash_1.find(this.members, { username });
    }
    join(newMember) {
        this.members.push(newMember);
    }
    leave(oldMember) {
        this.members = lodash_1.reject(this.members, mem => mem.username === oldMember.username);
    }
    kickMember(kicker, kickee) {
        if (!this.isLeader(kicker.username))
            return;
        const newLeaderMember = this.findMemberByUsername(kickee);
        if (!newLeaderMember)
            return;
        lodash_1.pull(this.members, newLeaderMember);
    }
    changeLeader(formerLeader, newLeader) {
        if (!this.isLeader(formerLeader.username))
            return;
        const newLeaderMember = this.findMemberByUsername(newLeader);
        if (!newLeaderMember)
            return;
        lodash_1.pull(this.members, newLeaderMember);
        this.members.unshift(newLeaderMember);
    }
}
exports.Party = Party;
//# sourceMappingURL=party.js.map