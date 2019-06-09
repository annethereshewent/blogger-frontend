import { Component, OnInit, ViewChildren, ElementRef, QueryList} from '@angular/core';
import { environment } from "../../environments/environment";
import { User } from "../../classes/User";
import { Friend } from "../../classes/Friend";
import { ChatBox } from "../../classes/ChatBox";
import io from 'socket.io-client';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

interface FriendResponse {
  success: boolean;
  message: string;
  is_friends: boolean;
}
interface FileReaderEventTarget extends EventTarget {
  result:string
}

interface FileReaderEvent extends Event {
  target: FileReaderEventTarget;
  getMessage():string;
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  @ViewChildren("chatBody") chatBodies: QueryList<ElementRef>;
  @ViewChildren("chat_upload") chat_uploads: QueryList<ElementRef>;

  chat_activated: boolean = false;
  socket: any = null;
  user: User;
  friends: Friend[] = [];
  production: boolean = environment.production;
  chat_boxes: ChatBox[] = [];
  chat_content: string[] = [];

  private userSubject: Subject<any> = new Subject<any>();

  entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  };


  constructor(private http: HttpClient) {

    this.user = JSON.parse(localStorage.getItem('current_user'));

    this
      .userSubject
      .pipe(debounceTime(600))
      .subscribe((user) => {
        this.is_friends(user)
      })

    if (this.user) {
      this.socket = io(environment.chat_url);
      this.socket.emit('login', { username: this.user.username, avatar: this.user.avatar_thumb, user_id: this.user.user_id })

      this.socket.emit('list');

      this.socket.on('user-list', (user) => {
        this.userSubject.next(user)
      });

      this.socket.on('list', () => {
        this.socket.emit('user-list', {
          username: this.user.username,
          avatar: this.user.avatar_thumb,
          user_id: this.user.user_id
        })
        
      });

      this.socket.on('chat_history', (message) => {
        let friend_index = this.friends.map((friend) => { return friend.username }).indexOf(message.to);
        if (friend_index != -1) {
          let friend = this.friends[friend_index];

          this.chat_content.push('');
          this.chat_boxes.push({ friend: friend, history: message.chat_logs });
          

          setTimeout(() => {
            let chatBody = this.chatBodies.toArray()[this.chatBodies.length-1];
            chatBody.nativeElement.scrollTop = chatBody.nativeElement.scrollHeight;
          }, 25)
        }
      })

      this.socket.on('message', (message) => {
        let index = this.chat_boxes.map((chat_box) => { return chat_box.friend.user_id }).indexOf(message.fromid);
        if (index != -1) {
          this.chat_boxes[index].history.push({ to: this.user.user_id, from: message.fromid, message: message.content });

          let chatBody = this.chatBodies.toArray()[index];
          this.scrollToBottom(chatBody);
        }
        else {
          this.socket.emit('history_request', {
            to: message.from,
            toid: message.fromid,
            from: this.user.username,
            fromid: this.user.user_id
          })
        }
      });

      this.socket.on('logout', (user) => {
        this.friends.splice(this.friends.map((friend) => { return friend.username }).indexOf(user),1);
      });
    }
  }

  ngOnInit() {

  }

  escapeHtml(string: string): string {
    return String(string).replace(/[&<>"'`=\/]/g, (s) => {
      return this.entityMap[s];
    });
  }

  sendMessage(friend: Friend, i: number): void {
    let content = this.escapeHtml(this.chat_content[i]);


    if (content != '') {
      this.socket.emit('message', {
        from: this.user.username,
        fromid: this.user.user_id,
        to: friend.username,
        toid: friend.user_id,
        content: content,
        type: "text"
      });

      this.chat_boxes[i].history.push({ to: friend.user_id, from: this.user.user_id, message: content});
      let chatBody = this.chatBodies.toArray()[i];

      this.scrollToBottom(chatBody);

      this.chat_content[i] = '';
      
    }


  }

  upload_image(event, i: number): void {
    let image = event.srcElement.files[0];
    let friend = this.chat_boxes[i].friend;

    let fileReader: FileReader = new FileReader();

    fileReader.onload = (e: FileReaderEvent): void => {
      this.socket.emit('message', {
        from: this.user.username,
        fromid: this.user.user_id,
        to: friend.username,
        toid: friend.user_id,
        content: e.target.result,
        type: 'image',
        extension: image.name.substring(image.name.lastIndexOf('.')+1)
      })
    };

    fileReader.readAsBinaryString(image);

    let previewReader = new FileReader();

    previewReader.onload = (e: FileReaderEvent): void => {
      this.chat_boxes[i].history.push({ 
        to: friend.user_id, 
        from: this.user.user_id, 
        message: '<a href="' + e.target.result + '"><img src="' + e.target.result + '" class="chat-image-file"></a>'
      });
    }

    previewReader.readAsDataURL(image);
  }

  open_upload(i: number): void {
    let chat_upload = this.chat_uploads.toArray()[i];
    chat_upload.nativeElement.click();
  }

  scrollToBottom(chatBody): void {
    setTimeout(() => {
      chatBody.nativeElement.scrollTop = chatBody.nativeElement.scrollHeight;  
    }, 20);
  }

  openChatBox(friend: Friend): void {
    if (this.chat_boxes.map((chat_box) => { return chat_box.friend.username }).indexOf(friend.username) == -1) {
      this.socket.emit('history_request', { 
        to: friend.username,
        toid: friend.user_id,
        from: this.user.username,
        fromid: this.user.user_id
      });
    }


  }

  closeChatBox(i) {
    this.chat_boxes.splice(i, 1);
    this.chat_content.splice(i, 1);
  }


  getPosition(i: number): string {
    return ((i+1) * 325) + "px";
  }
  is_friends(user) {
    if (user.username != this.user.username && !this.isDupe(user.username)) {
      this
        .http
        .get<FriendResponse>(`${environment.server_url}/api/is_friends/${user.username}`)
        .subscribe((data) => {
          this.friends.push(user);
        })
      ;
    }
  }
  /*
   * this.friends.map(friend => friend.username).indexOf(user.username)
   * isn't working so i have to do it like this.
   * also this is probably more efficient anyways?
   */
  isDupe(username: string) {
    for (let i = 0; i < this.friends.length; i++) {
      if (this.friends[i].username == username) {
        return true
      } 
    }

    return false
  }

  toggleChatList() {
    this.chat_activated = !this.chat_activated
  }
}
