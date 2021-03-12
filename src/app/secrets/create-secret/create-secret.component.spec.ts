import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateSecretComponent } from './create-secret.component';

describe('CreateSecretComponent', () => {
    let component: CreateSecretComponent;
    let fixture: ComponentFixture<CreateSecretComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CreateSecretComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CreateSecretComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
