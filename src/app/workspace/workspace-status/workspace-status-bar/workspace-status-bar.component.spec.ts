import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkspaceStatusBarComponent } from './workspace-status-bar.component';

describe('WorkspaceStatusBarComponent', () => {
  let component: WorkspaceStatusBarComponent;
  let fixture: ComponentFixture<WorkspaceStatusBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkspaceStatusBarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkspaceStatusBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
