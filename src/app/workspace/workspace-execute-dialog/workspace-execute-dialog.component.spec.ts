import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkspaceExecuteDialogComponent } from './workspace-execute-dialog.component';

describe('WorkspaceExecuteDialogComponent', () => {
  let component: WorkspaceExecuteDialogComponent;
  let fixture: ComponentFixture<WorkspaceExecuteDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkspaceExecuteDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkspaceExecuteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
