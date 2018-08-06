import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { YoutubeModalComponent } from './youtube-modal.component';

describe('YoutubeModalComponent', () => {
  let component: YoutubeModalComponent;
  let fixture: ComponentFixture<YoutubeModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ YoutubeModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(YoutubeModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
