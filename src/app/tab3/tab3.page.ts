import { Component, OnInit, Input } from '@angular/core';
import { interval } from 'rxjs';
import { map } from 'rxjs/internal/operators/map';

import * as playAlert from 'alert-sound-notify';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
})
export class Tab3Page implements OnInit {
  //Main clock
  mainTime!: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
  mainMins: number;
  mainSegs: number;
  mainStartDate: Date;
  mainFinishDate: Date = new Date();
  mainCounterTimer$;
  //player clock
  playerTime!: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
  playerMins: number;
  playerSegs: number;
  playerStartDate: Date;
  playerFinishDate: Date = new Date();
  playerCounterTimer$;

  //global

  runnig = false;
  paused = false;

  constructor() {
    playAlert.content.fail = ['../assets/fail.mp3'];
    playAlert.content.ring = ['../assets/ring.mp3'];
    playAlert.content.minute = ['../assets/minute.mp3'];
  }

  ngOnInit(): void {
    //inicializamos los relojes
    this.setMainTime();
    this.setPlayerTime();
  }

  setMainTime() {
    this.mainTime = {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
    this.mainMins = 50;
    this.mainSegs = 0;
    // Creamos la fecha a partir de los minutos de cada reloj
    this.setMainFinishDate(this.mainMins, this.mainSegs);
    //actualizamos el tiempo restante
    this.updateMainTime();
  }

  setPlayerTime() {
    this.playerTime = {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
    this.playerMins = 5;
    this.playerSegs = 0;
    // Creamos la fecha a partir de los minutos de cada reloj
    this.setPlayerFinishDate(this.playerMins, this.playerSegs);
    //actualizamos el tiempo restante
    this.updatePlayerTime();
  }

  setMainFinishDate(mins: number, segs: number): void {
    this.mainFinishDate = new Date();
    this.mainFinishDate.setMinutes(this.mainFinishDate.getMinutes() + mins);
    this.mainFinishDate.setSeconds(this.mainFinishDate.getSeconds() + segs);
  }

  setPlayerFinishDate(mins: number, segs: number): void {
    this.playerFinishDate = new Date();
    this.playerFinishDate.setMinutes(this.playerFinishDate.getMinutes() + mins);
    this.playerFinishDate.setSeconds(this.playerFinishDate.getSeconds() + segs);
  }

  updateMainTime() {
    const now = new Date();
    const diff = this.mainFinishDate.getTime() - now.getTime();

    // Cálculos para sacar lo que resta hasta ese tiempo objetivo / final
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor(diff / (1000 * 60));
    const secs = Math.floor(diff / 1000);

    // La diferencia que se asignará para mostrarlo en la pantalla
    this.mainTime.days = days;
    this.mainTime.hours = hours - days * 24;
    this.mainTime.minutes = mins - hours * 60;
    this.mainTime.seconds = secs - mins * 60;
  }

  updatePlayerTime() {
    const now = new Date();
    const diff = this.playerFinishDate.getTime() - now.getTime();

    // Cálculos para sacar lo que resta hasta ese tiempo objetivo / final
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor(diff / (1000 * 60));
    const secs = Math.floor(diff / 1000);

    // La diferencia que se asignará para mostrarlo en la pantalla
    this.playerTime.days = days;
    this.playerTime.hours = hours - days * 24;
    this.playerTime.minutes = mins - hours * 60;
    this.playerTime.seconds = secs - mins * 60;
  }

  startMain() {
    this.mainStartDate = new Date();
    this.runnig = true;
    return interval(1000).pipe(
      map((x: number) => {
        this.updateMainTime();
        return x;
      })
    );
  }

  startPlayer() {
    this.playerStartDate = new Date();
    this.runnig = true;
    return interval(1000).pipe(
      map((x: number) => {
        this.updatePlayerTime();
        return x;
      })
    );
  }

  playMain() {
    this.runnig = true;
    this.paused = false;
    //seteamos finishdate de ambos relojes si esta iniciando el juego
    this.setMainFinishDate(this.mainMins, this.mainSegs);
    //creamos el observable
    this.mainCounterTimer$ = this.startMain().subscribe((_) => {
      if (this.mainTime.minutes === 0 && this.mainTime.seconds === 0) {
        this.runnig = false;
        playAlert('fail');
        this.stopMain();
      }
    });
    this.playPlayer();
  }

  playPlayer() {
    this.runnig = true;
    this.paused = false;
    //seteamos el reloj
    this.setPlayerFinishDate(this.playerMins, this.playerSegs);
    //creamos el observable
    this.playerCounterTimer$ = this.startPlayer().subscribe((_) => {
      if (this.playerTime.minutes === 1 && this.playerTime.seconds === 0) {
        playAlert('minute');
      }
      if (this.playerTime.minutes === 0 && this.playerTime.seconds === 0) {
        this.runnig = false;
        playAlert('ring');
        this.stopPlayer();
      }
    });
  }

  pause() {
    this.runnig = false;
    this.paused = true;
    //descuscribir al observable
    this.mainCounterTimer$.unsubscribe();
    this.playerCounterTimer$.unsubscribe();
    //asignar tiempo principal actual a su reloj
    this.mainMins = this.mainTime.minutes;
    this.mainSegs = this.mainTime.seconds + 1;
    //asignar tiempo actual de player a su reloj
    this.playerMins = this.playerTime.minutes;
    this.playerSegs = this.playerTime.seconds + 1;
  }

  stopMain() {
    this.mainCounterTimer$.unsubscribe();
    this.setMainTime();
    this.stopPlayer();
    this.runnig = false;
    this.paused = false;
  }

  stopPlayer() {
    this.pause();
    this.setPlayerTime();
  }

  // play() {
  //   this.runnig = true;
  //   this.paused = false;
  //   console.log('----play-->time', this.time);
  //   this.setFinishDate(this.mins, this.segs);
  //   console.log('----setFinishDate-->time', this.time);
  //   this.counterTimer$ = this.start().subscribe((_) => {
  //     if (this.time.minutes === 1 && this.time.seconds === 0 && !this.main) {
  //       playAlert('minute');
  //     }
  //     if (this.time.minutes === 0 && this.time.seconds === 0) {
  //       this.runnig = false;
  //       if (this.main) {
  //         playAlert('fail');
  //       } else {
  //         playAlert('ring');
  //       }
  //       this.stop();
  //     }
  //   });
  // }

  // pause() {
  //   this.paused = true;
  //   this.runnig = false;
  //   this.counterTimer$.unsubscribe();
  //   this.mins = this.time.minutes;
  //   //adicion de un segundo para cuadrar con tiempo. Porq falta un seg?
  //   this.segs = this.time.seconds + 1;
  // }

  // stop() {
  //   console.log('entra-->time', this.time);
  //   this.runnig = false;
  //   this.paused = false;
  //   this.counterTimer$.unsubscribe();
  //   console.log('unsubcribe-->time', this.time);
  //   this.setFinishDate(this.gameTime, 0);
  //   console.log('setFinish-->time', this.time);
  //   this.updateTime();
  //   console.log('updateTime-->time', this.time);
  //   this.mins = this.gameTime;
  //   this.segs = 0;
  // }
}
