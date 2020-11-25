import { Pipe, PipeTransform } from '@angular/core';
import { WorkflowPhase } from '../../workflow/workflow.service';

@Pipe({
  name: 'phaseTranslate'
})
export class PhaseTranslatePipe implements PipeTransform {
  transform(phase: WorkflowPhase, ...args: any[]): any {
    switch (phase) {
      case 'Succeeded':
        return 'Completed';
    }

    return phase;
  }
}
