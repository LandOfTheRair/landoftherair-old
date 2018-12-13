import { Component, ElementRef, ViewChild } from '@angular/core';
import { LocalStorage } from 'ngx-webstorage';

@Component({
  selector: 'app-journal',
  templateUrl: './journal.component.html',
  styleUrls: ['./journal.component.scss']
})
export class JournalComponent {

  @LocalStorage('journal')
  public journal: string;

}
