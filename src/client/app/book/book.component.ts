import { Component, Input, OnInit } from '@angular/core';
import { IPlayer } from '../../../shared/interfaces/character';
import { ColyseusGameService } from '../colyseus.game.service';

@Component({
  selector: 'app-book',
  templateUrl: './book.component.html',
  styleUrls: ['./book.component.scss']
})
export class BookComponent implements OnInit {

  public get book() {
    return this.colyseusGame.character.rightHand;
  }

  public get currentPage() {
    return this.book.bookPages[this.book.bookCurrentPage];
  }

  constructor(public colyseusGame: ColyseusGameService) { }

  // TODO checkboxes for each page, centered, max of 10 per line

  ngOnInit() {
    this.colyseusGame.updateActiveWindowForGameWindow('book');
    if(!this.book.bookCurrentPage) this.colyseusGame.sendCommandString(`~page right 0`);
  }

  prevPage() {
    this.colyseusGame.sendCommandString(`~page right ${this.book.bookCurrentPage - 1}`);
    this.book.bookCurrentPage--;
  }

  nextPage() {
    this.colyseusGame.sendCommandString(`~page right ${this.book.bookCurrentPage + 1}`);
    this.book.bookCurrentPage++;
  }

}
