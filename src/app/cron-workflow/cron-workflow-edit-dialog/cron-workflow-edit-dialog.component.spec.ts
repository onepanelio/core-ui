import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CronWorkflowEditDialogComponent } from './cron-workflow-edit-dialog.component';

describe('CronWorkflowEditDialogComponent', () => {
  let component: CronWorkflowEditDialogComponent;
  let fixture: ComponentFixture<CronWorkflowEditDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CronWorkflowEditDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CronWorkflowEditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
