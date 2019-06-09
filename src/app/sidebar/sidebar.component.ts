import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from "../../classes/User";
import { environment } from "../../environments/environment";
import { RequestService } from "../request.service";

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  current_user: User;
  cloned_user: User;
  @Input() user: User;
  @Output() userReset: EventEmitter<User> = new EventEmitter<User>()

  sidebar_active: boolean = false
  production: boolean =  environment.production


  showSidebarSettings: boolean = false;

  constructor(private http: HttpClient, private requestService: RequestService) {
    this.current_user = JSON.parse(localStorage.getItem('current_user'))

    this.requestService.dash_sidebar_active$.subscribe((active) => {
      this.sidebar_active = active
    })
  }

  getAvatarSrc() {
    return environment.production ? this.user.avatar_small : 'http://localhost:3000' + this.user.avatar_small
  }

  cancelSidebarSettings() {
    this.userReset.emit(this.cloned_user)
    this.showSidebarSettings = false
  }

  saveSidebarSettings() {

  }

  getBannerStyle() {
    let banner = ''
    if (this.user) {
      banner = environment.production ? this.user.banner : 'http://localhost:3000' + this.user.banner
    }

    return {
      'background-image': `url(${banner})`
    }
  }

  showSidebar() {
    this.cloned_user = JSON.parse(JSON.stringify(this.user))

    this.showSidebarSettings = true
  }

  ngOnInit() {
  }

}