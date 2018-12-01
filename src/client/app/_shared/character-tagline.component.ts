import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { IPlayer } from '../../../shared/interfaces/character';

@Component({
  selector: 'app-character-tagline',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
  <span *ngIf="player">
    {{ player.name }}<span *ngIf="!short"> the {{ player.alignment }} level {{ player.level }} {{ player.baseClass }}</span>
  </span>`
})
export class PlayerTaglineComponent {

  @Input()
  public player: IPlayer;

  @Input()
  public short: boolean;
}
