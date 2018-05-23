import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Player } from '../../../shared/models/player';

@Component({
  selector: 'app-character-tagline',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span *ngIf="player">{{ player.name }} the {{ player.alignment }} level {{ player.level }} {{ player.baseClass }}</span>`
})
export class PlayerTaglineComponent {

  @Input()
  public player: Player = new Player({});
}
