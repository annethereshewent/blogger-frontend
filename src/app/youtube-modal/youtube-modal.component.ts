import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { RequestService } from "../request.service";
import { HttpClient } from '@angular/common/http';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from "../../classes/User";
import { Post } from "../../classes/Post";
import { environment } from "../../environments/environment";
import { ValidatorService } from "../validator.service";

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
  tags: any[];
  @Output() postEmitter: EventEmitter<Post> = new EventEmitter<Post>();

  constructor(public bsModalRef: BsModalRef, private requestService: RequestService, private http: HttpClient, private validatorService: ValidatorService) {
    this.youtubeForm = new FormGroup({
      "youtube_url": new FormControl(this.youtube_url, [this.validatorService.required()]),
      "tags": new FormControl(this.tags)
    });
  }

  loadYoutubeVideo(): void {
    if (this.youtube_url != '') {
      let youtube_id = this.requestService.parseYoutubeURL(this.youtube_url);

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
      if (this.youtube_video != '') {
        this
          .http
          .post<PostResponse>(`${environment.server_url}/api/create_post`, { post: this.youtube_video, client: "web"})
          .subscribe((data) => {
            if (data.success) {
              this.postEmitter.emit(data.post);
            }

            this.bsModalRef.hide();
          }) 
        ;
      }


    }
    else {
      this.bsModalRef.hide();
    }
  }

  ngOnInit() {
  }
}
