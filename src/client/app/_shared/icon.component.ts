
import { Component, Input } from '@angular/core';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-icon',
  styles: [`
    .mac-container {
      min-width: 48px;
      max-width: 48px;
      min-height: 48px;
      max-height: 48px;
      overflow: hidden;
    }
    
    .mac-container.normal .macicons {
      font-size: 300%;
    }
    
    .mac-container.small {
      min-width: 32px;
      max-width: 32px;
      min-height: 32px;
      max-height: 32px;
    }
    
    .mac-container.small .macicons {
      font-size: 200%;
    }
    
    .mac-container.xsmall {
      min-width: 24px;
      max-width: 24px;
      min-height: 24px;
      max-height: 24px;
    }
    
    .mac-container.xsmall .macicons {
      font-size: 110%;
    }
  `],
  template: `
    <div class="mac-container vertical-center" [ngClass]="[size]" [style.background-color]="bgColor">
      <span class="macicons" [ngClass]="['macicons-'+name]" container="body" [style.color]="fgColor"></span>
    </div>
  `
})
export class IconComponent {

  @Input()
  public name: string = 'undecided';

  @Input()
  public size: 'normal' | 'small' | 'xsmall' = 'normal';

  @Input()
  public bgColor: string = 'white';

  @Input()
  public fgColor: string = '#000';

  get imgUrl() {
    return `${environment.client.protocol}://${environment.client.domain}:${environment.client.port}/assets/icons/${this.name || 'undecided'}.svg`;
  }

}
