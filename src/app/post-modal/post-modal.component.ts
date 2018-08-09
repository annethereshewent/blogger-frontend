import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { User } from "../../classes/User";
import { Post } from "../../classes/Post";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from "../../environments/environment";
import { RequestService } from "../request.service";

declare var $: any;

interface SubmitPostInterface { 
  success: Boolean;
  post: Post;
  message: String;
}

@Component({
  selector: 'app-post-modal',
  templateUrl: './post-modal.component.html',
  styleUrls: ['./post-modal.component.scss']
})
export class PostModalComponent implements OnInit {

  editorContent: String;
  user: User;
  editorHeading: String = "Create a new post";

  buttonLabel: String = "Submit Post";

  tags: any[] = [];

  @Output() postEmitter: EventEmitter<Post> = new EventEmitter<Post>();

  @Input() post: Post;
  @Input() type: String;
  @Input() edit_tags: string[];
  options = {
    // inlineMode: false,
    // paragraphy: true,
    // placeholder:"",
    width: "80%",
    height: "250px",
    //toolbarButtons: ["indent", "outdent", "strikeThrough", "bold", "italic", "underline", "insertImage", "insertUnorderedList"],
    toolbarButtons: ["fullscreen", "|", 'indent', 'outdent', 'quote', '|', 'strikeThrough', 'bold', 'italic', 'underline', 'paragraphFormat', '|', 'formatUL', 'formatOL', "insertTable", '|', 'insertImage', "insertVideo" ],
    // inverseSkin: true,
    theme: "dark",
    imageUploadURL: `${environment.server_url}/posts/upload_image`,
    imageUploadMethod: 'Post',
    events : {
      'froalaEditor.html.set' : function(e, editor) {
        setTimeout(() => {
          editor.events.focus();
          editor.selection.setAfter(editor.$el.get(0));
          editor.selection.restore();  
        }, 500)
        
      }
    }
  }


  constructor(public bsModalRef: BsModalRef, private http: HttpClient, private requestService: RequestService) {
    let user = JSON.parse(localStorage.getItem('current_user'));
    if (user) {
      this.user = user;
    }

  }

  // initialize(initControls) {
  //   initControls.getEditor('events.focus', true);
  // }

  ngOnInit() {
    if (this.post) {
      this.editorContent = this.post.post;
      this.buttonLabel = this.type == "edit" ? "Edit Post" : "Quote Post";
      this.editorHeading = this.type == 'edit' ? "Edit Post" : "Quote Post";

      if (this.edit_tags) {
        this.tags = this.edit_tags.map((tag) => { return { display: tag, value: tag } })
      }
    }
  }

  postRequest(url, postParams): void {
    let headers = new HttpHeaders()
      .set("Authorization", this.user.token)
    ;

    this
      .http
      .post<SubmitPostInterface>(url, postParams, { headers: headers })
      .subscribe((data) => {
        if (data.success) {
          console.log("post request was successful");
          this.postEmitter.emit(data.post);
          this.bsModalRef.hide();
        }
        else {
          console.log(data.message);
        }
      })
    ; 
  } 

  submitPost(): void {
    if (this.user) {

      //first check to see if the post has any youtube URLs
      let youtube_id = this.requestService.parseYoutubeURL(this.editorContent);
      if (youtube_id !== null) {
        youtube_id = $("<div>").append(youtube_id).text();
        this.editorContent = this.requestService.getYoutubeVideo(youtube_id);
      }

      if (this.post && this.type == 'edit') {
        //this is an edit post request
        let postParams = {
          post: this.editorContent,
          id: this.post.id,
          tags: this.tags.map((tag) => { return tag.value }),
          client: "web"
        };

        this.postRequest(`${environment.server_url}/api/edit_post/${this.post.id}`, postParams)
      }
      else {
        let postParams = {
          post: this.editorContent,
          tags: this.tags.map((tag) => { return tag.value }),
          client: "web"
        };

        this.postRequest(`${environment.server_url}/api/create_post`, postParams);
      }
      
    }
    else {
      console.log("error: user not found");
    }

  } 

}