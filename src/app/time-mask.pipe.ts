import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeMask',
})
export class TimeMaskPipe implements PipeTransform {
  transform(value: any): string {
    if (value < 10) {
      return '0' + value;
    }
    return value;
  }
}
