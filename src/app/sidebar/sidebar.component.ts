import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from "../../classes/User";
import { environment } from "../../environments/environment";
import { RequestService } from "../request.service";

interface SidebarResponse {
  success: boolean,
  message: string
}

interface FileReaderEventTarget extends EventTarget {
  result:string
}

interface FileReaderEvent extends Event {
  target: FileReaderEventTarget;
  getMessage():string;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  current_user: User;
  cloned_user: User;
  @Input() user: User;
  @Output() userReset: EventEmitter<User> = new EventEmitter<User>();
  @Output() userUpdate: EventEmitter<User> = new EventEmitter<User>();

  avatar_file: File;
  banner_file: File;


  sidebar_active: boolean = false
  production: boolean =  environment.production

  showSidebarSettings: boolean = false;

  constructor(private http: HttpClient, private requestService: RequestService) {
    this.current_user = JSON.parse(localStorage.getItem('current_user'))

    this.requestService.dash_sidebar_active$.subscribe((active) => {
      this.sidebar_active = active
    })
  }

  cancelSidebarSettings() {
    this.userReset.emit(this.cloned_user)
    this.avatar_file = null
    this.banner_file = null
    this.showSidebarSettings = false
  }

  saveSidebarSettings() {
    let formData = new FormData()

    formData.append('text_color', this.user.text_color)
    formData.append('background_color', this.user.background_color)

    if (this.avatar_file) {
      formData.append('avatar', this.avatar_file)
    }
    if (this.banner_file) {
      formData.append('banner', this.banner_file)
    }

    this
      .http
      .post<SidebarResponse>(`${environment.server_url}/api/save_sidebar_settings`, formData)
      .subscribe((data) => {
        if (data.success) {
          this.userUpdate.emit(this.user)
        }
      })
  }

  getBannerStyle() {
    return {
      'background-image': `url(${this.user.banner})`
    }
  }

  showSidebarOptions() {
    this.cloned_user = JSON.parse(JSON.stringify(this.user))

    this.showSidebarSettings = true
  }

  onImageChange(event, type) {
    let image = event.srcElement.files[0];

    if (image) {
      let fileReader: FileReader = new FileReader();

      fileReader.onload = (e: FileReaderEvent): void => {
        if (type == 'avatar') {
          this.user.avatar_small = e.target.result
        }
        else if (type == 'banner') {
          this.user.banner = e.target.result
        }
      };

      if (type == 'avatar') {
        this.avatar_file = image
      }
      else if (type == 'banner') {
        this.banner_file = image
      }

      fileReader.readAsDataURL(image)
    }
    
  }

  ngOnInit() {

  }
}