import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'workspacePhaseStatus'
})
export class WorkspacePhaseStatusPipe implements PipeTransform {
  static mapping = new Map<string, string>([
      ['Launching', 'Launching...'],
      ['Failed', 'Failed'],
      ['Failed to launch', 'Failed to launch'],
      ['Failed to resume', 'Failed to resume'],
      ['Updating', 'Updating...'],
      ['Failed to terminate', 'Failed to terminate'],
      ['Failed to launch', 'Failed to launch'],
      ['Failed to upgrade', 'Failed to upgrade'],
      ['Running', 'Running'],
      ['Pausing', 'Pausing'],
      ['Failed to pause', 'Failed to pause'],
      ['Paused', 'Paused'],
      ['Terminating', 'Terminating'],
      ['Terminated', 'Terminated'],
  ]);

  transform(value: any, ...args: any[]): any {
    return WorkspacePhaseStatusPipe.mapping.get(value);
  }
}
