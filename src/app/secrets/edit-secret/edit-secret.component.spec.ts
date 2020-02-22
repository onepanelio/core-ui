import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSecretComponent } from './edit-secret.component';

describe('EditSecretComponent', () => {
  let component: EditSecretComponent;
  let fixture: ComponentFixture<EditSecretComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditSecretComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditSecretComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
