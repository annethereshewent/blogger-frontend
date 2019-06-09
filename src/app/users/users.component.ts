import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RequestService } from "../request.service";

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {

  constructor(public router: Router, private requestService: RequestService) {

  }

  ngOnInit() {

  }

  dashboardPath() {
    this.requestService.posts = null;
    this.router.navigate(['/users/dashboard']);
  }

}
