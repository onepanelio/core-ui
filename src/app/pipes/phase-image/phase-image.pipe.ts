import { Input, Pipe, PipeTransform } from '@angular/core';
import { WorkflowPhase } from "../../workflow/workflow.service";

@Pipe({
  name: 'phaseImage'
})
export class PhaseImagePipe implements PipeTransform {
  static completeImageSource = '/assets/images/status-icons/completed.svg';
  static failedImageSource = '/assets/images/status-icons/failed.svg';
  static pausedImageSource = '/assets/images/status-icons/paused.svg';
  static runningGreenImageSource = '/assets/images/status-icons/running-green.svg';
  static runningBlueImageSource = '/assets/images/status-icons/running-blue.svg';
  static stoppedImageSource = '/assets/images/status-icons/stopped.svg';
  static notRunImageSource = '/assets/images/status-icons/notrun.svg';
  static skippedImageSource = '/assets/images/status-icons/notrun.svg';

  static statusMap = new Map<WorkflowPhase, string>([
    ['Succeeded', PhaseImagePipe.completeImageSource],
    ['Pending', PhaseImagePipe.notRunImageSource],
    ['Running', PhaseImagePipe.runningBlueImageSource],
    ['Failed', PhaseImagePipe.failedImageSource],
    ['Error', PhaseImagePipe.failedImageSource],
    ['Skipped', PhaseImagePipe.skippedImageSource]
  ]);

  transform(phase: WorkflowPhase, ...args: any[]): any {
    return PhaseImagePipe.statusMap.get(phase);
  }
}
