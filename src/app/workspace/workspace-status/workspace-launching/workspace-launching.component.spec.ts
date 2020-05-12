import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkspaceLaunchingComponent } from './workspace-launching.component';

describe('WorkspaceLaunchingComponent', () => {
  let component: WorkspaceLaunchingComponent;
  let fixture: ComponentFixture<WorkspaceLaunchingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkspaceLaunchingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkspaceLaunchingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
