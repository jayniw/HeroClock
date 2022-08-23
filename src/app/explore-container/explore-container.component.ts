import { Component, OnInit, Input } from '@angular/core';
import { interval } from 'rxjs';
import { map } from 'rxjs/internal/operators/map';

import * as playAlert from 'alert-sound-notify';

@Component({
  selector: 'app-explore-container',
  templateUrl: './explore-container.component.html',
  styleUrls: ['./explore-container.component.scss'],
})
export class ExploreContainerComponent implements OnInit {
  @Input() main: boolean;
  @Input() gameTime: number;
  mins = 0;
  segs = 0;
  time!: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
  startDate: Date;
  finishDate: Date = new Date();
  counterTimer$;
  runnig = false;
  paused = false;

  constructor() {
    playAlert.content.fail = ['../assets/fail.mp3'];
    playAlert.content.ring = ['../assets/ring.mp3'];
    playAlert.content.minute = ['../assets/minute.mp3'];
  }

  ngOnInit(): void {
    // Inicializamos el momento que falta hasta llegaral tiempo objetivo con valores en 0
    this.time = {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
    this.mins = this.gameTime;
    //asignamos un tiempo por defecto si no se paso el dato
    if (this.gameTime === null || this.gameTime <= 0) {
      this.mins = 50;
      this.segs = 0;
    }
    // Creamos la fecha a partir de los minutos
    this.setFinishDate(this.mins, this.segs);
    this.updateTime();
  }

  /**
   * It calculates the difference between the current date and the finish date, and then it assigns the
   * difference to the time object
   */
  updateTime() {
    const now = new Date();
    const diff = this.finishDate.getTime() - now.getTime();

    // Cálculos para sacar lo que resta hasta ese tiempo objetivo / final
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor(diff / (1000 * 60));
    const secs = Math.floor(diff / 1000);

    // La diferencia que se asignará para mostrarlo en la pantalla
    this.time.days = days;
    this.time.hours = hours - days * 24;
    this.time.minutes = mins - hours * 60;
    this.time.seconds = secs - mins * 60;
  }

  /**
   * It returns an observable that emits a number every second, and updates the time
   *
   * @returns An Observable that emits a number every second.
   */
  start() {
    this.startDate = new Date();
    this.runnig = true;
    return interval(1000).pipe(
      map((x: number) => {
        this.updateTime();
        return x;
      })
    );
  }

  /**
   * Set the finishDate property to a new Date object, and set the minutes to the current minutes plus
   * the minutes parameter.
   *
   * @param mins - number - the number of minutes to add to the current time to set the finish
   * date
   */
  setFinishDate(mins: number, segs: number): void {
    this.finishDate = new Date();
    this.finishDate.setMinutes(this.finishDate.getMinutes() + mins);
    this.finishDate.setSeconds(this.finishDate.getSeconds() + segs);
  }

  play() {
    this.runnig = true;
    this.paused = false;
    this.setFinishDate(this.mins, this.segs);
    this.counterTimer$ = this.start().subscribe((_) => {
      if (this.time.minutes === 1 && this.time.seconds === 0 && !this.main) {
        playAlert('minute');
      }
      if (this.time.minutes === 0 && this.time.seconds === 0) {
        this.runnig = false;
        if (this.main) {
          playAlert('fail');
        } else {
          playAlert('ring');
        }
        this.stop();
      }
    });
  }

  pause() {
    this.paused = true;
    this.runnig = false;
    this.counterTimer$.unsubscribe();
    this.mins = this.time.minutes;
    //adicion de un segundo para cuadrar con tiempo. Porq falta un seg?
    this.segs = this.time.seconds + 1;
  }

  stop() {
    this.runnig = false;
    this.paused = false;
    this.counterTimer$.unsubscribe();
    this.mins = this.gameTime;
    this.segs = 0;
    this.setFinishDate(this.mins, this.segs);
    this.updateTime();
  }
}
