import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { RequestService } from "../request.service";

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UsersComponent implements OnInit {

  constructor(private router: Router, private requestService: RequestService) {
    console.log(this.router.url.indexOf('/users/tags'));
  }

  ngOnInit() {

  }

  dashboardPath() {
    this.requestService.posts = null;
    this.router.navigate(['/users/dashboard']);
  }

}
