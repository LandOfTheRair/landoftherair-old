import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-log-message',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span *ngIf="message.dirFrom">From the {{ message.dirFrom }} you hear </span>
    <strong *ngIf="message.name">{{ message.name }}: </strong>{{ message.message }}
  `,
  styles: [`
  `]
})
export class LogMessageComponent {
  @Input()
  public message;

  constructor() {}
}
