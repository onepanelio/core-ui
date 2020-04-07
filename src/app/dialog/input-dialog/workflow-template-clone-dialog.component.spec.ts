import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowTemplateCloneDialog } from './workflow-template-clone-dialog.component';

describe('InputDialogComponent', () => {
  let component: WorkflowTemplateCloneDialog;
  let fixture: ComponentFixture<WorkflowTemplateCloneDialog>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkflowTemplateCloneDialog ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkflowTemplateCloneDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
