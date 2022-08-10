import { Component, OnInit, Input } from '@angular/core';
import { interval } from 'rxjs';
import { map } from 'rxjs/internal/operators/map';
@Component({
  selector: 'app-explore-container',
  templateUrl: './explore-container.component.html',
  styleUrls: ['./explore-container.component.scss'],
})
export class ExploreContainerComponent implements OnInit {
  @Input() finishDateString: string;
  time!: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
  finishDate: Date = new Date();

  constructor() {}

  ngOnInit(): void {
    // Inicializamos el momento que falta hasta llegaral tiempo objetivo con valores en 0
    this.time = {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
    // Creamos la fecha a partir de la fecha en formato string AAAA-MM-dd HH:mm:ss
    //this.finishDate = new Date(this.finishDateString);

    //this.start().subscribe((_) => console.log('tik'));
    this.updateTime();
  }

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

  // Ejecutamos la acción cada segundo, para obtener la diferencia entre el momento actual y el objetivo
  start() {
    return interval(1000).pipe(
      map((x: number) => {
        this.updateTime();
        return x;
      })
    );
  }

  inciar() {
    this.finishDate = new Date();
    this.finishDate.setMinutes(this.finishDate.getMinutes() + 50);
    const counterTimer$ = this.start().subscribe((_) => {
      if (this.time.days <= 0) {
        this.time = {
          hours: 0,
          minutes: 0,
          seconds: 0,
          days: 0,
        };
        counterTimer$.unsubscribe();
      }
    });
  }
}
