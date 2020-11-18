import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MetricsEditDialogComponent } from './metrics-edit-dialog.component';

describe('MetricsEditDialogComponent', () => {
  let component: MetricsEditDialogComponent;
  let fixture: ComponentFixture<MetricsEditDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MetricsEditDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MetricsEditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
