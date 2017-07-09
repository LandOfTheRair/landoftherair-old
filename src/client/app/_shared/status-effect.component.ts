
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-status-effect',
  styles: [`
    .status-effect {
      position: relative;
      display: flex;
      text-align: center;
      
      max-width: 38px;
      max-height: 38px;
      
      padding-top: 8px;
    }
    
    .status-remaining {
      position: absolute;
      top: 0;
      font-size: 0.8rem;
      font-weight: bold;
      text-align: center;
      width: 100%;
    }
  `],
  template: `
      <div class="status-effect" *ngIf="effect.iconData">
        <div class="status-remaining">{{ effect.duration }}</div>
        <app-icon bgColor="transparent"
                  [fgColor]="effect.iconData.color"
                  [name]="effect.iconData.name"
                  size="small"
                  container="body"
                  [tooltip]="effect.name"></app-icon>
      </div>
  `
})
export class StatusEffectComponent {

  @Input()
  public effect: any;
}
