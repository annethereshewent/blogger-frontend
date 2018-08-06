import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { User } from "../../classes/User";
import { Post } from "../../classes/Post";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from "../../environments/environment";


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

  @Output() postEmitter: EventEmitter<Post> = new EventEmitter<Post>();

  @Input() post: Post;
  @Input() type: String;

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
        console.log("something happened");
        setTimeout(() => {
          editor.events.focus();
          editor.selection.setAfter(editor.$el.get(0));
          editor.selection.restore();  
        }, 500)
        
      }
    }
  }


  constructor(public bsModalRef: BsModalRef, private http: HttpClient) {
    let user = JSON.parse(localStorage.getItem('current_user'));
    if (user) {
      this.user = user;
    }

  }

  initialize(initControls) {
    initControls.getEditor('events.focus', true);
  }

  ngOnInit() {
    if (this.post) {
      this.editorContent = this.post.post;
      this.buttonLabel = this.type == "edit" ? "Edit Post" : "Quote Post";
      this.editorHeading = this.type == 'edit' ? "Edit Post" : "Quote Post";
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

  submitPost() {
    if (this.user) {
      if (this.post && this.type == 'edit') {
        //this is an edit post request
        let postParams = {
          post: this.editorContent,
          id: this.post.id,
          client: "web"
        };

        this.postRequest(`${environment.server_url}/api/edit_post/${this.post.id}`, postParams)
      }
      else {
        let postParams = {
          post: this.editorContent,
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
