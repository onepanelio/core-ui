import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowExecuteDialogComponent } from './workflow-execute-dialog.component';

describe('WorkflowExecuteDialogComponent', () => {
  let component: WorkflowExecuteDialogComponent;
  let fixture: ComponentFixture<WorkflowExecuteDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkflowExecuteDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkflowExecuteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
