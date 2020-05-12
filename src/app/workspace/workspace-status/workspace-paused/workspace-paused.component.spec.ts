import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkspacePausedComponent } from './workspace-paused.component';

describe('WorkspacePausedComponent', () => {
  let component: WorkspacePausedComponent;
  let fixture: ComponentFixture<WorkspacePausedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkspacePausedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkspacePausedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
