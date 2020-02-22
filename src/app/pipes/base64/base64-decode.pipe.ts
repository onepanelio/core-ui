import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'base64decode'
})
export class Base64DecodePipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    return atob(value);
  }
}
