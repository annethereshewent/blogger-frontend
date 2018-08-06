import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { RequestService } from "../request.service";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from "../../classes/User";
import { Post } from "../../classes/Post";
import { environment } from "../../environments/environment";

interface PostResponse {
  success: boolean;
  message: string;
  post: Post;
}

@Component({
  selector: 'app-youtube-modal',
  templateUrl: './youtube-modal.component.html',
  styleUrls: ['./youtube-modal.component.scss']
})
export class YoutubeModalComponent implements OnInit {

  youtube_video: string = '';
  youtube_url: string = '';
  youtubeForm: FormGroup;
  @Output() postEmitter: EventEmitter<Post> = new EventEmitter<Post>();

  constructor(public bsModalRef: BsModalRef, private requestService: RequestService, private http: HttpClient) {
    this.youtubeForm = new FormGroup({
      "youtube_url": new FormControl(this.youtube_url, [this.required()])
    });
  }

  required() {
    return (control: FormControl): any => {
      if (control.value == null || control.value.trim() == '') {
        return {
          required: {
            value: control.value
          } 
        };
      }

      return null; 
    }
    
  }

  loadYoutubeVideo(): void {
    if (this.youtube_url != '') {
      console.log(this.youtube_url);
      let youtube_id = this.requestService.parseYoutubeURL(this.youtube_url)[7];

      if (youtube_id === null) {
        this.youtube_video = '';
      }
      else {
        this.youtube_video = this.requestService.getYoutubeVideo(youtube_id);
      }
    }
  }

  submitVideo(): void {
    let user: User = JSON.parse(localStorage.getItem('current_user'));
    if (user) {
      let headers = new HttpHeaders()
        .set("Authorization", user.token)
      ;
      if (this.youtube_video != '') {
        this
          .http
          .post<PostResponse>(`${environment.server_url}/api/create_post`, { post: this.youtube_video, client: "web"}, { headers: headers})
          .subscribe((data) => {
            if (data.success) {
              this.postEmitter.emit(data.post);
            }
            else {
              console.log("could not create video");
            }

            this.bsModalRef.hide();
          }) 
        ;
      }


    }
    else {
      console.log("user not found!");
      this.bsModalRef.hide();
    }
  }

  ngOnInit() {
  }
}
