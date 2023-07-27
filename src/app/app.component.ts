import { Component, OnInit, ViewChild } from '@angular/core';
import { interval } from 'rxjs';
import { map } from 'rxjs/internal/operators/map';

import * as playAlert from 'alert-sound-notify';
import { IonModal } from '@ionic/angular';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  @ViewChild(IonModal) modal: IonModal;
  enableConfig = true;
  //Main clock
  mainTime!: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
  mainMins = 50;
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
  playerMins = 5;
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
    this.enableConfig = false;
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
    this.enableConfig = true;
  }

  stopPlayer() {
    this.pause();
    this.setPlayerTime();
  }

  showConfig() {
    const log = 'show config';
    console.log(
      '🚀 ~ file: app.component.ts:215 ~ AppComponent ~ showConfig ~ log:',
      log
    );
  }

  confirmConfig() {
    this.modal.dismiss([this.mainMins, this.playerMins], 'confirm');
    console.log(
      '🚀 ~ file: app.component.ts:225 ~ AppComponent ~ confirmConfig ~ :',
      [this.mainMins, this.playerMins]
    );
    this.setMainTime();
    this.setPlayerTime();
  }
}
