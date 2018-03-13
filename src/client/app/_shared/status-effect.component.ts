
import { Component, Input } from '@angular/core';

import { startCase } from 'lodash';

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
      z-index: 20;
      text-shadow: -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff; 
      color: #000;
      user-select: none;
    }
  `],
  template: `
      <div class="status-effect" *ngIf="effect && effect.iconData">
        <div class="status-remaining" *ngIf="effect.buildupCur > 0">{{ buildupPercent }}%</div>
        <div class="status-remaining" *ngIf="effect.duration > 0">{{ effect.duration }}</div>
        <app-icon [fgColor]="effect.iconData.color"
                  [bgColor]="effect.iconData.bgColor || 'transparent'"
                  [name]="effect.iconData.name"
                  size="small"
                  container="body"
                  [tooltip]="effectTooltipTemplate"></app-icon>
        
        <ng-template #effectTooltipTemplate>
          <strong>{{ effectName }}</strong><br>
          {{ effect.iconData.tooltipDesc || '' }}
          <div *ngIf="effect.effectInfo && effect.effectInfo.casterName">
            <br>
            <strong>Source:</strong> {{ effect.effectInfo.casterName }}
          </div>
        </ng-template>
      </div>
  `
})
export class StatusEffectComponent {

  @Input()
  public effect: any;

  get effectName(): string {
    return startCase(this.effect.name);
  }

  get buildupPercent(): number {
    return Math.min(100, Math.floor(this.effect.buildupCur / this.effect.buildupMax * 100));
  }
}
