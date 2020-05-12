import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'workspacePhaseStatus'
})
export class WorkspacePhaseStatusPipe implements PipeTransform {
  static mapping = new Map<string, string>([
      ['Started', 'Launching...'],
      ['Running', 'Running'],
      ['Pausing', 'Pausing'],
      ['Paused', 'Paused'],
      ['Terminating', 'Terminating'],
      ['Terminated', 'Terminated'],
  ])

  transform(value: any, ...args: any[]): any {
    return WorkspacePhaseStatusPipe.mapping.get(value);
  }
}
