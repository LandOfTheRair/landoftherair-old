"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NRP = require("node-redis-pubsub");
const party_1 = require("../../models/party");
const lodash_1 = require("lodash");
const redisUrl = process.env.REDIS_URL;
class PartyManager {
    constructor(room) {
        this.room = room;
        this.parties = {};
        this.redis = new NRP({ url: redisUrl });
        this.initListeners();
    }
    initListeners() {
        this.redis.on('party:create', ({ leader, partyName }) => {
            this._redisCreateParty(leader, partyName);
        });
        this.redis.on('party:join', ({ joiner, partyName }) => {
            this._redisJoinParty(joiner, partyName);
        });
        this.redis.on('party:leave', ({ leaver, partyName }) => {
            this._redisLeaveParty(leaver, partyName);
        });
        this.redis.on('party:kick', ({ leader, kickee, partyName }) => {
            this._redisKickFromParty(leader, kickee, partyName);
        });
        this.redis.on('party:changeleader', ({ leader, newLeader, partyName }) => {
            this._redisChangePartyLeader(leader, newLeader, partyName);
        });
        this.redis.on('party:updatemember', ({ member, partyName }) => {
            this._redisUpdateMember(member, partyName);
        });
        this.redis.on('party:sync', ({ parties, roomName }) => {
            if (this.room.roomName === roomName)
                return;
            this.parties = parties;
        });
        this.redis.on('party:requestsync', ({ roomName }) => {
            if (this.room.roomName === roomName)
                return;
            this.redis.emit('party:sync', { parties: this.parties, roomName: this.room.roomName });
        });
        this.redis.emit('party:requestsync', { roomName: this.room.roomName });
    }
    stopEmitting() {
        this.redis.quit();
    }
    getPartyByName(name) {
        return this.parties[name];
    }
    sendPartyMessage(partyName, message) {
        const party = this.parties[partyName];
        if (!party)
            return;
        this.room.sendMessageToUsernames(lodash_1.map(party.allMembers, 'username'), message);
    }
    createParty(leader, partyName) {
        const leaderMember = new party_1.PartyPlayer(leader);
        leader.partyName = partyName;
        this.redis.emit('party:create', { leader: leaderMember, partyName });
    }
    _redisCreateParty(leader, partyName) {
        this.parties[partyName] = new party_1.Party(leader, partyName);
    }
    joinParty(joiner, partyName) {
        const member = new party_1.PartyPlayer(joiner);
        if (!this.parties[partyName])
            return;
        joiner.partyName = partyName;
        this.redis.emit('party:join', { joiner: member, partyName });
    }
    _redisJoinParty(joiner, partyName) {
        if (!this.parties[partyName])
            return;
        this.parties[partyName].join(joiner);
        this.sendPartyMessage(partyName, `${joiner.name} has joined the "${partyName}" party!`);
    }
    leaveParty(leaver) {
        const member = new party_1.PartyPlayer(leaver);
        const partyName = leaver.partyName;
        leaver.partyName = '';
        this.redis.emit('party:leave', { leaver: member, partyName });
    }
    _redisLeaveParty(leaver, partyName) {
        const party = this.parties[partyName];
        if (!party)
            return;
        const oldLeader = party.leader;
        party.leave(leaver);
        if (party.canBeDeleted) {
            this.removeParty(party);
        }
        else {
            if (oldLeader.username !== party.leader.username) {
                this.sendPartyMessage(partyName, `${party.leader.name} is the new party leader.`);
            }
        }
        this.sendPartyMessage(partyName, `${leaver.name} has left the "${partyName}" party!`);
    }
    kickFromParty(leader, kickee) {
        const member = new party_1.PartyPlayer(leader);
        const kickeeMember = new party_1.PartyPlayer(kickee);
        const partyName = leader.partyName;
        if (!this.parties[partyName] || !this.parties[partyName].isLeader(leader.username))
            return;
        kickee.partyName = '';
        this.redis.emit('party:kick', { leader: member, kickee: kickeeMember, partyName });
    }
    _redisKickFromParty(leader, kickee, partyName) {
        if (!this.parties[partyName])
            return;
        this.parties[partyName].kickMember(leader, kickee.username);
        this.sendPartyMessage(partyName, `${kickee.name} was kicked from the "${partyName}" party!`);
    }
    changeLeader(formerLeader, newLeader) {
        const member = new party_1.PartyPlayer(formerLeader);
        const partyName = formerLeader.partyName;
        if (!this.parties[partyName] || !this.parties[partyName].isLeader(formerLeader.username))
            return;
        this.redis.emit('party:changeleader', { leader: member, newLeader: newLeader.username, partyName });
    }
    _redisChangePartyLeader(leader, newLeader, partyName) {
        const party = this.parties[partyName];
        if (!party || !party.isLeader(leader.username))
            return;
        party.changeLeader(leader, newLeader);
        this.sendPartyMessage(partyName, `${party.leader.name} is the new leader of the "${partyName}" party!`);
    }
    updateMember(member) {
        this.redis.emit('party:updatemember', { member: new party_1.PartyPlayer(member), partyName: member.partyName });
    }
    _redisUpdateMember(member, partyName) {
        const party = this.parties[partyName];
        if (!party)
            return;
        const memberRef = lodash_1.find(party.allMembers, { username: member.username });
        lodash_1.extend(memberRef, member);
    }
    removeParty(party) {
        delete this.parties[party.name];
    }
}
exports.PartyManager = PartyManager;
//# sourceMappingURL=party-manager.js.map