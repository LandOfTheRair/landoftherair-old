import { Component, OnInit, Input, ViewChild, OnDestroy } from '@angular/core';
import { ColyseusLobbyService } from '../colyseus.lobby.service';

import { truncate, capitalize, some } from 'lodash';
import { LocalStorage } from 'ngx-webstorage';
import { ColyseusGameService } from '../colyseus.game.service';

@Component({
  selector: 'app-character-select',
  templateUrl: './character-select.component.html',
  styleUrls: ['./character-select.component.scss']
})
export class CharacterSelectComponent implements OnInit, OnDestroy {

  @ViewChild('charModal')
  public charModal;

  @Input()
  public resourcesLoaded: any;

  @LocalStorage()
  public curSlot;

  public confirmOverwrite: boolean;

  private account$: any;
  private hasToured: boolean;

  public get statusString(): string {
    if(!this.resourcesLoaded.done) return 'Loading... (' + this.resourcesLoaded.current + '/' + this.resourcesLoaded.total + ')';
    if(this.game._joiningGame) return 'Joining...';

    return 'Play';
  }

  public get charSlots(): number[] {
    return Array(this.lobby.myAccount.maxCharacters).fill(0);
  }

  constructor(public lobby: ColyseusLobbyService, public game: ColyseusGameService) { }

  ngOnInit() {
    if(!this.curSlot) this.curSlot = 0;

    // give users a brief tour if their account has no characters
    this.account$ = this.lobby.myAccount$.subscribe(() => {
      if(!this.lobby.myAccount.username || this.hasToured) return;
      this.hasToured = true;
      if(!some(this.lobby.myAccount.characterNames)) this.lobby.tour$.next(true);
    });
  }

  ngOnDestroy() {
    this.account$.unsubscribe();
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
