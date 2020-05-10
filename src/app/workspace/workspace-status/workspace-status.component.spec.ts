import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkspaceStatusComponent } from './workspace-status.component';

describe('WorkspaceStatusComponent', () => {
  let component: WorkspaceStatusComponent;
  let fixture: ComponentFixture<WorkspaceStatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkspaceStatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkspaceStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
