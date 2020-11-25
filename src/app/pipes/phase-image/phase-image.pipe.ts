import { Pipe, PipeTransform } from '@angular/core';
import { WorkflowPhase } from '../../workflow/workflow.service';

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

  transform(phase: WorkflowPhase, ...args: any[]): any {
    switch (phase) {
      case 'Pending':
        return PhaseImagePipe.notRunImageSource;
      case 'Running':
        return PhaseImagePipe.runningBlueImageSource;
      case 'Succeeded':
        return PhaseImagePipe.completeImageSource;
      case 'Skipped':
        return PhaseImagePipe.skippedImageSource;
      case 'Failed':
        return PhaseImagePipe.failedImageSource;
      case 'Error':
        return PhaseImagePipe.failedImageSource;
      case 'Omitted':
        return PhaseImagePipe.skippedImageSource;
      case 'Terminated':
        return PhaseImagePipe.stoppedImageSource;
    }

    return null;
  }
}
