import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkspaceViewComponent } from './workspace-view.component';

describe('WorkspaceViewComponent', () => {
  let component: WorkspaceViewComponent;
  let fixture: ComponentFixture<WorkspaceViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkspaceViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkspaceViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
