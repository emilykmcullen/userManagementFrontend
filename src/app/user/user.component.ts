import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import {BehaviorSubject, Subscription} from 'rxjs';
import { NotificationType } from '../enum/notification-type.enum';
import { User } from '../models/user';
import { NotificationService } from '../service/notification.service';
import { UserService } from '../service/user.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  private titleSubject = new BehaviorSubject<string>('Users');
  public titleAction$ = this.titleSubject.asObservable();
  public users: User[];
  public refreshing: boolean;
  public selectedUser: User;
  private subscriptions: Subscription[] = [];

  constructor(private userService: UserService, private notificationService: NotificationService) { }

  ngOnInit(): void {
    this.getUsers(true);
  }

  public changeTitle(title: string): void {
    this.titleSubject.next(title);
  }

  public getUsers(showNotification: boolean): void{
    this.refreshing = true; 
    this.subscriptions.push();
    this.userService.getUsers().subscribe(
      (response: User[]) => {
        this.userService.addUsersToLocalCache(response);
        this.users = response;
        this.refreshing = false;
        if (showNotification) {
          this.sendNotification(NotificationType.SUCCESS, `${response.length} user(s) loaded successfully`)
        }
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
        this.refreshing = false;
      }
    )

  }

  public onSelectUser(selectedUser: User): void {
    this.selectedUser = selectedUser;
    document.getElementById('openUserInfo').click();
  }

  private sendNotification(notificationType: NotificationType, message: string): void {
    if(message){
      this.notificationService.showNotification(notificationType, message);
    }
    else {
      this.notificationService.showNotification(notificationType, "An error occured. Please try again.")
    }
  }


  

}
