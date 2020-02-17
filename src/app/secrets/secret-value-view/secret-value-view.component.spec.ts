import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SecretValueViewComponent } from './secret-value-view.component';

describe('SecretValueViewComponent', () => {
  let component: SecretValueViewComponent;
  let fixture: ComponentFixture<SecretValueViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SecretValueViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SecretValueViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
