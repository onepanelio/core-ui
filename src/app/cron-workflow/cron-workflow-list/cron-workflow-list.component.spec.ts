import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CronWorkflowListComponent } from './cron-workflow-list.component';

describe('CronWorkflowListComponent', () => {
  let component: CronWorkflowListComponent;
  let fixture: ComponentFixture<CronWorkflowListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CronWorkflowListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CronWorkflowListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
