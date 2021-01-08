import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateFromUtc'
})
export class DateFromUtcPipe implements PipeTransform {
  transform(value: any, exponent = 0): any {
    const versionNumber = parseInt(value, 10);
    let utcSeconds = versionNumber;

    if (exponent > 0) {
      utcSeconds = Math.floor(versionNumber / Math.pow(10, exponent));
    }

    const utcDate = new Date(0);
    utcDate.setUTCSeconds(utcSeconds);

    return utcDate;
  }
}
