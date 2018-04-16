
import { compact } from 'lodash';

import { Player } from '../../../shared/models/player';
import { Allegiance } from '../../../shared/models/character';

export class PartyHelper {

  static getPartyMembersInRange(player: Player, distance = 7): Player[] {
    const playerRefs = player.party.members.map(({ username }) => {
      if(username === player.username) return;
      const memberRef = player.$$room.state.findPlayer(username);

      if(player.distFrom(memberRef) > distance) return null;

      return memberRef;
    });

    return compact(playerRefs);
  }

  static shareRepWithParty(player: Player, allegiance: Allegiance, delta: number) {
    PartyHelper.getPartyMembersInRange(player).forEach(partyMember => {
      partyMember.changeRep(allegiance, delta, true);
    });
  }

  static shareSkillWithParty(player: Player, skill: number) {
    const party = player.party;

    const members = party.members;

    if(members.length > 4) {
      skill = skill * 0.75;
    }

    if(members.length > 7) {
      skill = skill * 0.75;
    }

    skill = Math.floor(skill);

    PartyHelper.getPartyMembersInRange(player).forEach(partyMember => {
      partyMember.gainCurrentSkills(skill);
    });
  }

  static shareExpWithParty(player: Player, exp: number): number {
    const party = player.party;

    const members = party.members;

    if(members.length > 4) {
      exp = exp * 0.75;
    }

    if(members.length > 7) {
      exp = exp * 0.75;
    }

    exp = Math.floor(exp);

    let foundMembers = 0;

    PartyHelper.getPartyMembersInRange(player).forEach(partyMember => {
      foundMembers++;
      partyMember.gainExp(exp);
    });

    return foundMembers;
  }

  static shareKillsWithParty(player: Player, questOpts) {
    PartyHelper.getPartyMembersInRange(player).forEach(partyMember => {
      partyMember.checkForQuestUpdates(questOpts);
    });
  }
}
