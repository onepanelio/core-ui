import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrefixFileInputComponent } from './prefix-file-input.component';

describe('PrefixFileInputComponent', () => {
  let component: PrefixFileInputComponent;
  let fixture: ComponentFixture<PrefixFileInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrefixFileInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrefixFileInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
