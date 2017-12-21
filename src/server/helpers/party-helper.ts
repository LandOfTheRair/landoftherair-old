
import { Player } from '../../shared/models/player';
import { Allegiance } from '../../shared/models/character';

export class PartyHelper {

  static shareRepWithParty(player: Player, allegiance: Allegiance, delta: number) {
    const party = player.party;

    const members = party.allMembers;

    members.forEach(({ username }) => {
      if(username === player.username) return;

      const partyMember = player.$$room.state.findPlayer(username);
      if(player.distFrom(partyMember) > 7) return;

      partyMember.changeRep(allegiance, delta, true);
    });
  }

  static shareSkillWithParty(player: Player, skill: number) {
    const party = player.party;

    const members = party.allMembers;

    if(members.length > 4) {
      skill = skill * 0.75;
    }

    if(members.length > 7) {
      skill = skill * 0.75;
    }

    skill = Math.floor(skill);

    members.forEach(({ username }) => {
      if(username === player.username) return;

      const partyMember = player.$$room.state.findPlayer(username);
      if(player.distFrom(partyMember) > 7) return;

      partyMember.gainSkill(skill);
    });
  }

  static shareExpWithParty(player: Player, exp: number) {
    const party = player.party;

    const members = party.allMembers;

    if(members.length > 4) {
      exp = exp * 0.75;
    }

    if(members.length > 7) {
      exp = exp * 0.75;
    }

    exp = Math.floor(exp);

    members.forEach(({ username }) => {
      if(username === player.username) return;

      const partyMember = player.$$room.state.findPlayer(username);
      if(player.distFrom(partyMember) > 7) return;

      partyMember.gainExp(exp);
    });
  }
}
