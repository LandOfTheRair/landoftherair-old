import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { LocalStorageService } from 'ngx-webstorage';

@Component({
  selector: 'app-journal',
  templateUrl: './journal.component.html',
  styleUrls: ['./journal.component.scss']
})
export class JournalComponent implements OnInit {

  @ViewChild('journal')
  public journalEl: ElementRef;

  constructor(private localStorage: LocalStorageService) { }

  async ngOnInit() {
    this.journalEl.nativeElement.innerText = await this.localStorage.retrieve('journal') || 'Click to edit the contents of your journal.';
  }

  save() {
    this.localStorage.store('journal', this.journalEl.nativeElement.innerText);
  }

}
