
import * as NRP from 'node-redis-pubsub';
import { Player } from '../../shared/models/player';
import { Party, PartyPlayer } from '../../shared/models/party';
import { GameWorld } from '../rooms/GameWorld';

import { map, find, extend } from 'lodash';

const redisUrl = process.env.REDIS_URL;

export class PartyArbiter {

  private parties: { [key: string]: Party } = {};
  private redis: NRP;

  constructor() {
    this.redis = new NRP({ url: redisUrl });

    this.initListeners();
  }

  private initListeners() {

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
      if('Arbiter' === roomName) return;
      this.parties = parties;
    });

    this.redis.on('party:requestsync', ({ roomName }) => {
      if('Arbiter' === roomName) return;
      this.redis.emit('party:sync', { parties: this.parties, roomName: 'Arbiter' });
    });

  }

  public stopEmitting() {
    this.redis.quit();
  }

  private _redisCreateParty(leader: PartyPlayer, partyName: string) {
    this.parties[partyName] = new Party(leader, partyName);
  }

  private _redisJoinParty(joiner: PartyPlayer, partyName: string) {
    if(!this.parties[partyName]) return;

    this.parties[partyName].join(joiner);
  }

  private _redisLeaveParty(leaver: PartyPlayer, partyName: string) {
    const party = this.parties[partyName];

    if(!party) return;

    party.leave(leaver);
    if(party.canBeDeleted) {
      this.removeParty(party);
    }
  }

  private _redisKickFromParty(leader: PartyPlayer, kickee: PartyPlayer, partyName: string) {
    if(!this.parties[partyName]) return;

    this.parties[partyName].kickMember(leader, kickee.username);
  }

  private _redisChangePartyLeader(leader: PartyPlayer, newLeader: string, partyName: string) {
    const party = this.parties[partyName];
    if(!party || !party.isLeader(leader.username)) return;

    party.changeLeader(leader, newLeader);
  }

  private _redisUpdateMember(member: PartyPlayer, partyName: string) {
    const party = this.parties[partyName];
    if(!party) return;

    const memberRef = find(party.allMembers, { username: member.username });
    extend(memberRef, member);
  }

  private removeParty(party: Party) {
    delete this.parties[party.name];
  }

}
