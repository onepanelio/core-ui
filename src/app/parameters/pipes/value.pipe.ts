import { Pipe, PipeTransform } from '@angular/core';
import { Parameter } from "../../../api";

@Pipe({
  name: 'appParameterValue'
})
export class ValuePipe implements PipeTransform {
  transform(value: any, ...args: any[]): any {
    return this.transfromHint(value);
  }

  // transform, but with types for IDE and sanity.
  private transfromHint(value: Parameter): string {
    if(value.type === 'select.select') {
      return this.transformSelect(value);
    }

    return value.value;
  }

  private transformSelect(value: Parameter): string {
    for(const option of value.options) {
      if(option.value === value.value) {
        return option.name  + ` (${value.value})`;
      }
    }

    return null;
  }
}
