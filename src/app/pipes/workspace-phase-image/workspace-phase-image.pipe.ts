import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'workspacePhaseImage'
})
export class WorkspacePhaseImagePipe implements PipeTransform {
  static startedImageSource = '/assets/images/status-icons/running-blue.svg';
  static runningImageSource = '/assets/images/status-icons/running-green.svg';
  static pausingImageSource = '/assets/images/status-icons/paused.svg';
  static pausedImageSource = '/assets/images/status-icons/paused.svg';
  static terminatingImageSource = '/assets/images/status-icons/failed.svg';
  static terminatedSource = '/assets/images/status-icons/failed.svg';

  static statusMap = new Map<string, string>([
    ['Launching', WorkspacePhaseImagePipe.startedImageSource],
    ['Updating', WorkspacePhaseImagePipe.startedImageSource],
    ['Running', WorkspacePhaseImagePipe.runningImageSource],
    ['Pausing', WorkspacePhaseImagePipe.pausingImageSource],
    ['Paused', WorkspacePhaseImagePipe.pausedImageSource],
    ['Terminating', WorkspacePhaseImagePipe.terminatingImageSource],
    ['Terminated', WorkspacePhaseImagePipe.terminatedSource],
    ['Failed', WorkspacePhaseImagePipe.terminatedSource],
    ['Failed to pause', WorkspacePhaseImagePipe.terminatedSource],
    ['Failed to resume', WorkspacePhaseImagePipe.terminatedSource],
    ['Failed to terminate', WorkspacePhaseImagePipe.terminatedSource],
    ['Failed to launch', WorkspacePhaseImagePipe.terminatedSource],
    ['Failed to upgrade', WorkspacePhaseImagePipe.terminatedSource]
  ]);

  transform(phase: string, ...args: any[]): any {
    return WorkspacePhaseImagePipe.statusMap.get(phase);
  }
}
