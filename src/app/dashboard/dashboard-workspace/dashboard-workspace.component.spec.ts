import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardWorkspaceComponent } from './dashboard-workspace.component';

describe('DashboardWorkspaceComponent', () => {
  let component: DashboardWorkspaceComponent;
  let fixture: ComponentFixture<DashboardWorkspaceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardWorkspaceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardWorkspaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
