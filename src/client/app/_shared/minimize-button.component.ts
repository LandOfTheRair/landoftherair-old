import { Component } from '@angular/core';

@Component({
  selector: 'app-minimize-button',
  template: `<button class="no-border-radius btn btn-warning btn-sm float-right">_</button>`,
  styles: [
    `button {
      font-size: 1.1rem;
      padding-top: 0.11rem;
      padding-bottom: 0.11rem;
      height: 26px;
      min-width: 30px;
      margin-right: -1px;
    }`
  ]
})
export class MinimizeButtonComponent {}
