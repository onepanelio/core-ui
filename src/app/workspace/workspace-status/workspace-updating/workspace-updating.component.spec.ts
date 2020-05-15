import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkspaceUpdatingComponent } from './workspace-updating.component';

describe('WorkspaceUpdatingComponent', () => {
  let component: WorkspaceUpdatingComponent;
  let fixture: ComponentFixture<WorkspaceUpdatingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkspaceUpdatingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkspaceUpdatingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
