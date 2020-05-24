import { Pipe, PipeTransform } from '@angular/core';
import { WorkflowExecutionExtensions } from "../../models";

@Pipe({
  name: 'workflowIsActive'
})
export class WorkflowIsActivePipe implements PipeTransform {
  transform(value: any, ...args: any[]): any {
    if(!value) {
      return false;
    }

    return WorkflowExecutionExtensions.isActive(value);
  }
}
