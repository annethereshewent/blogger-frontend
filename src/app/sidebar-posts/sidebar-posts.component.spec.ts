import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarPostsComponent } from './sidebar-posts.component';

describe('SidebarPostsComponent', () => {
  let component: SidebarPostsComponent;
  let fixture: ComponentFixture<SidebarPostsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SidebarPostsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarPostsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
