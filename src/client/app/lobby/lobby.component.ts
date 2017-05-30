import { Component, Input } from '@angular/core';
import { LobbyState } from '../../../models/lobbystate';
import { ColyseusLobbyService } from '../colyseus.lobby.service';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss']
})
export class LobbyComponent {

  @Input()
  public lobbyState: LobbyState = new LobbyState({});

  public chatText: string;

  constructor(public lobby: ColyseusLobbyService) { }

  sendMessage() {
    if(!this.chatText || !this.chatText.trim()) return;

    this.lobby.sendMessage(this.chatText);
    this.chatText = '';
  }

}
