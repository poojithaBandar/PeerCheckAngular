import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeerSessionComponent } from './peer-session.component';

describe('PeerSessionComponent', () => {
  let component: PeerSessionComponent;
  let fixture: ComponentFixture<PeerSessionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PeerSessionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PeerSessionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
