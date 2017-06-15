
import { Component, Input } from '@angular/core';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-icon',
  styles: [`
    img.normal {
      width: 64px;
      height: 64px;
    }
    
    img.small {
      width: 48px;
      height: 48px
    }
    
    img.xsmall {
      width: 24px;
      height: 24px;
    }
  `],
  template: `
    <img class="{{ size }}" [src]="imgUrl" container="body" />
  `
})
export class IconComponent {

  @Input()
  public name: string = 'undecided';

  @Input()
  public size: 'normal' | 'small' | 'xsmall' = 'normal';

  get imgUrl() {
    return `${environment.client.protocol}://${environment.client.domain}:${environment.client.port}/assets/icons/${this.name}.svg`;
  }

}
