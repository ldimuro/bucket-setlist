import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrackConfirmationComponent } from './track-confirmation.component';

describe('TrackConfirmationComponent', () => {
  let component: TrackConfirmationComponent;
  let fixture: ComponentFixture<TrackConfirmationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrackConfirmationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrackConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
