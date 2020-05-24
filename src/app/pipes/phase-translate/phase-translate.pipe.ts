import { Pipe, PipeTransform } from '@angular/core';
import { WorkflowPhase } from "../../workflow/workflow.service";

@Pipe({
  name: 'phaseTranslate'
})
export class PhaseTranslatePipe implements PipeTransform {
  static statusPhraseMap = new Map<WorkflowPhase, string>([
    ['Succeeded', 'Completed'],
    ['Pending', 'Pending'],
    ['Running', 'Running'],
    ['Failed', 'Failed'],
    ['Error', 'Error'],
    ['Skipped', 'Skipped'],
    ['Terminated', 'Terminated']
  ]);

  transform(phase: WorkflowPhase, ...args: any[]): any {
    return PhaseTranslatePipe.statusPhraseMap.get(phase);
  }
}
