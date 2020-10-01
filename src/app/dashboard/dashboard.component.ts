import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { GameService } from '../service/game.service';
import { Observable } from 'rxjs';
import { AuthService } from '../service/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  public gameId$: Observable<string>;
  public gameId: string;
  public gameInfo: string = "";
  private turn$: Observable<string>;

  constructor(private games: GameService, private auth: AuthService, private change: ChangeDetectorRef) { 
    this.gameId$ = this.games.getGame();
    this.gameId$.subscribe(o => {
      this.gameId = o;
      this.change.detectChanges();
    })
  }

  ngOnInit(): void {
    this.gameId$ = this.games.getGame();
    this.gameId$.subscribe(o => {
      this.gameId = o;
      this.change.detectChanges();
    });

    this.turn$ = this.games.getTurn();
    this.turn$.subscribe(o => {
      if (this.inGame()) {
        this.gameInfo = (o === this.auth.getUserId() ? "Your Turn" : "Their Turn");
      } else {
        this.gameInfo = "You are not in a game";
      }
      this.change.detectChanges();
    });

    this.games.getWinner().subscribe(o => {
      if (o === 'cat') {
        this.gameInfo = "Cat's Scratch!";
      } else {
        this.gameInfo = (o === this.auth.getUserId() ? "You Won!" : "You Lost!");
      }
      this.change.detectChanges();
    });
  }
  newGame(): void {
    this.games.newGame();
  }

  endGame(): void {
    this.games.deleteGame();
  }

  joinGame(id: string) {
    this.games.joinGame(id);
  }
  inGame(): boolean {
    return this.gameId !== "none";
  }

}


