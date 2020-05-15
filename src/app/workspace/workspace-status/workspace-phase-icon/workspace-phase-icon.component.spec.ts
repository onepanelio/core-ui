import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkspacePhaseIconComponent } from './workspace-phase-icon.component';

describe('WorkspacePhaseIconComponent', () => {
  let component: WorkspacePhaseIconComponent;
  let fixture: ComponentFixture<WorkspacePhaseIconComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkspacePhaseIconComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkspacePhaseIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
