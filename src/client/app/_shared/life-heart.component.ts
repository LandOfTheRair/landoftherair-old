import { Component, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-life-heart',
  template: `<div class="heart">
              <div class="fill" [style.clip-path]="hpPercentGradient"></div>
              <div class="outline"></div>
            </div>`,
  styles: [`
    .heart {
      width: 14px;
      height: 14px;
      position: relative;
      margin-top: 2px;
      display: block;
    }
    
    .heart .fill {
      display: block;
      height: 16px;
      width: 16px;
      left: -1px;
      overflow: hidden;
      position: absolute;
      top: -4px;
      z-index: 300;
    }
    
    .heart .fill:before, .heart .fill:after {
      background: #e74c3c;
      background: linear-gradient(to bottom, #f8e36d 0%,#e42403 31%,#b72606 100%);
      border-radius: 9px 9px;
      content: "";
      height: 12px;
      left: 7px;
      position: absolute;
      top: 5px;
      width: 7px;
      transform: rotate(-45deg);
      transform-origin: 0 100%;
    }
    
    .heart .fill:after {
     left: 0;
     transform: rotate(45deg);
     transform-origin: 100% 100%;
    }
    
    .heart .outline {
      position: relative;
      margin-left: 1px;
    }
    
    .heart .outline:before, .heart .outline:after {
      position: absolute;
      content: "";
      width: 10px;
      height: 15px;
      top: 0;
      left: 5px;
      background: #000;
      border-radius: 11px 11px;
      transform: rotate(-45deg);
      transform-origin: 0 100%;
    }
    
    .heart .outline:after {
      left: -5px;
      transform: rotate(45deg);
      transform-origin: 100% 100%;
    }
  `]
})
export class LifeHeartComponent {
  @Input()
  public target;

  constructor(private domSanitizer: DomSanitizer) {}

  get hpPercentGradient() {
    const hpp = this.hpPercent;
    return this.domSanitizer.bypassSecurityTrustStyle(`polygon(0% ${hpp}%, 0% 100%, 100% 100%, 100% ${hpp}%)`);
  }

  get hpPercent() {
    return 100 - ((this.target.hp.__current / this.target.hp.maximum) * 100);
  }
}
