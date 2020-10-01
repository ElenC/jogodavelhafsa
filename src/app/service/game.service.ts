
import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireObject, AngularFireList } from 'angularfire2/database';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class GameService {

  public EMPTY_BOARD = ["", "", "", "", "", "", "", "", ""]; 
  public piece: string = "";
  public inGame: boolean = false;
  public gameId$: Observable<string>;
  public gameId: string = "";
  public board$: Observable<string[]>;
  public board: string[] = this.EMPTY_BOARD;
  public winner$: Observable<string>;
  public turn$: Observable<string>;

  constructor(private auth: AuthService, private db: AngularFireDatabase) {
    let uid = this.auth.getUserId();

    this.gameId$ = new Observable(o => {
      this.db.database.ref(`users/${uid}/game`).on('value', s => {
        if (s.exists()) {
          o.next(s.val());
          this.gameId = s.val();
        } else {
          o.next("none");
          this.gameId = "none";
        }
      }, e => {
        o.next("none");
        this.gameId = "none";
      });
    });

    this.board$ = new Observable(o => {
      this.gameId$.subscribe(id => {
        this.db.database.ref(`games/${id}/board`).on('value', s => {
          if (s.exists()) {
            o.next(s.val());
            this.board = s.val();
          } else {
            o.next(this.EMPTY_BOARD);
            this.board = this.EMPTY_BOARD;
          }
        }, e => {
          o.next(this.EMPTY_BOARD);
          this.board = this.EMPTY_BOARD;
        });
      });
    });

    // get piece
    this.gameId$.subscribe(id => {
      this.db.database.ref(`games/${id}/${uid}`).on('value', s => {
        this.piece = s.val();
      }, e => {
        this.piece = "";
      });
    });

    //Get Turn
    this.turn$ = new Observable(o => {
      this.gameId$.subscribe(id => {
        this.db.database.ref(`games/${id}/turn`).on('value', s => {
          if (s.exists()) {
            o.next(s.val());
          } else {
            o.next("none");
          }
        }, e => {
          o.next("none");
        });
      });
    });

    // Get Winner
  this.winner$ = new Observable(o => {
    this.gameId$.subscribe(id => {
      this.db.database.ref(`games/${id}/winner`).on('value', s => {
        if (s.exists()) {
          o.next(s.val());
        }
      });
    });
  });
 }

  newGame(): void {
    const uid = this.auth.getUserId()

    this.db.database.ref(`users/${uid}/game/board`).once('value').then(s => {
      if (!s.exists()) {
        let id = require('shortid').generate();

        this.db.object(`games/${id}/board`).update({
          0: "", 1: "", 2: "",
          3: "", 4: "", 5: "",
          6: "", 7: "", 8: ""
        });

        this.db.object(`users/${uid}`).update({
          game: id
        });

        // the creator of the game should be "O's"
        this.db.object(`games/${id}/${uid}`).set("O");
        this.db.object(`games/${id}/user1`).set(uid);
      }
    });
  }

  deleteGame(): void {
    this.db.object(`games/${this.gameId}`).remove();
  }

  getGame(): Observable<string> {
    return this.gameId$;
  }

  getBoard(): Observable<string[]> {
    return this.board$;
  }

  play(pos: number): void {
    let newBoard = this.board;
    newBoard[pos] = this.piece;
    this.db.object(`games/${this.gameId}/board`).set(newBoard);
  }

  getWinner(): Observable<string> {
    return this.winner$;
  }

  getTurn(): Observable<string> {
    return this.turn$;
  }

  joinGame(id: string) {
    const uid = this.auth.getUserId();
    this.db.database.ref(`games/${id}`).once('value').then(v => {
      if (!v.exists()) {
        alert("Sorry, a game with ID " + id + " does not exist.");
      } else {
        this.db.object(`users/${uid}`).update({
          game: id
        });

        // the guest of the game should be "X's"
        this.db.object(`games/${id}/${uid}`).set("X");
        this.db.object(`games/${id}/user2`).set(uid);
      }
    });
  }
}