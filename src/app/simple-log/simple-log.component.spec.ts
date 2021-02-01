import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SimpleLogComponent } from './simple-log.component';

describe('SimpleLogComponent', () => {
  let component: SimpleLogComponent;
  let fixture: ComponentFixture<SimpleLogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SimpleLogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SimpleLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
