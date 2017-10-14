import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ColyseusLobbyService } from '../colyseus.lobby.service';
import { LobbyState } from '../../../shared/models/lobbystate';

import { truncate, capitalize } from 'lodash';
import { LocalStorage } from 'ngx-webstorage';

@Component({
  selector: 'app-character-select',
  templateUrl: './character-select.component.html',
  styleUrls: ['./character-select.component.scss']
})
export class CharacterSelectComponent implements OnInit {

  @ViewChild('charModal')
  public charModal;

  public charSlots: any[];

  @Input()
  public resourcesLoaded: any;

  @LocalStorage()
  public curSlot;

  public confirmOverwrite: boolean;

  constructor(public lobby: ColyseusLobbyService) { }

  ngOnInit() {
    if(!this.curSlot) this.curSlot = 0;
    this.charSlots = Array(this.lobby.myAccount.maxCharacters).fill(0);
  }

  getCharacter() {
    this.lobby.getCharacterCreatorCharacter();
  }

  deleteCharacter() {
    this.lobby.myCharacter = {};
  }

  private invalidName() {
    const name = this.lobby.myCharacter.name;
    return !name || name.length < 2;
  }

  invalidCharacterInfo() {
    return this.invalidName() || (this.needsOverwrite && !this.confirmOverwrite);
  }

  validateName() {
    let name = this.lobby.myCharacter.name;
    name = capitalize(truncate(name.replace(/[^a-zA-Z]/g, ''), { length: 20, omission: '' }));
    this.lobby.myCharacter.name = name;
  }

  createCharacter() {
    this.lobby.createCharacter(this.curSlot);
    this.charModal.hide();
  }

  get needsOverwrite() {
    return this.lobby.myAccount.characterNames[this.curSlot];
  }

  playCharacter() {
    this.lobby.playCharacter(this.curSlot);
  }

}
