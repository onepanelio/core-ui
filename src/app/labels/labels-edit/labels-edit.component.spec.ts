import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LabelsEditComponent } from './labels-edit.component';

describe('LabelsEditComponent', () => {
  let component: LabelsEditComponent;
  let fixture: ComponentFixture<LabelsEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LabelsEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LabelsEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
