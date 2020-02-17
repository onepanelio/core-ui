import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClosableSnackComponent } from './closable-snack.component';

describe('ClosableSnackComponent', () => {
  let component: ClosableSnackComponent;
  let fixture: ComponentFixture<ClosableSnackComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClosableSnackComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClosableSnackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
