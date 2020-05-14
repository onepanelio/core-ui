import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkspaceViewParametersComponent } from './workspace-view-parameters.component';

describe('WorkspaceViewParametersComponent', () => {
  let component: WorkspaceViewParametersComponent;
  let fixture: ComponentFixture<WorkspaceViewParametersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkspaceViewParametersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkspaceViewParametersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
