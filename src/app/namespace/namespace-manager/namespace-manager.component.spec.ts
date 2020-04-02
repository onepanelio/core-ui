import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NamespaceManagerComponent } from './namespace-manager.component';

describe('NamespaceManagerComponent', () => {
  let component: NamespaceManagerComponent;
  let fixture: ComponentFixture<NamespaceManagerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NamespaceManagerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NamespaceManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
