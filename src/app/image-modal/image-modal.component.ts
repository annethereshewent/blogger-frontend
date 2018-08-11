import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { environment } from "../../environments/environment";
import { User } from "../../classes/User";
import { Post } from "../../classes/Post";
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

@Component({
  selector: 'app-image-modal',
  templateUrl: './image-modal.component.html',
  styleUrls: ['./image-modal.component.scss']
})
export class ImageModalComponent implements OnInit {

  user: User = JSON.parse(localStorage.getItem('current_user'));

  config: any;

  @Output() postEmitter: EventEmitter<Post> = new EventEmitter<Post>();
  tags: any[];


  constructor(public bsModalRef: BsModalRef) {
    if (this.user) {
      this.config = {
        url: `${environment.server_url}/api/upload_image`,
        method: 'post',
        paramName: 'file',
        params: { tags: this.tags },
        acceptedFiles: "image/*",
        headers: {
          "Authorization": this.user.token
        }
      };
    }
  }

  onUploadSuccess(data: any[]) {
    let response = data[1];
    if (response.success) {
      this.postEmitter.emit(response.post);
      this.bsModalRef.hide();
    }

  }

  ngOnInit() {
  }

}
