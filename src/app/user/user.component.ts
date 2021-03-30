import { HttpErrorResponse } from '@angular/common/http';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import {BehaviorSubject, Subscription} from 'rxjs';
import { NotificationType } from '../enum/notification-type.enum';
import { CustomHttpResponse } from '../models/custom-http-response';
import { User } from '../models/user';
import { AuthenticationService } from '../service/authentication.service';
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
  public user: User;
  public refreshing: boolean;
  public selectedUser: User;
  private subscriptions: Subscription[] = [];
  public fileName: string;
  public profileImage: File;
  public editUser = new User();
  private currentUsername: string;

  constructor(private authenticationService: AuthenticationService, private userService: UserService,
               private notificationService: NotificationService) { }

  ngOnInit(): void {
    this.user = this.authenticationService.getUserFromLocalCache();
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
    this.clickButton('openUserInfo');
  }

  public onProfileImageChange(fileName: string, profileImage: File): void {
    this.fileName = fileName;
    this.profileImage = profileImage;
  }

  public saveNewUser(): void {
    this.clickButton('new-user-save');
  }

  public onAddNewUser(userForm: NgForm): void {
    const formData = this.userService.createUserFormData(null, userForm.value, this.profileImage);
    this.subscriptions.push(
    this.userService.addUser(formData).subscribe(
      (response: User) => {
        this.clickButton('new-user-close');
        this.getUsers(false);
        this.fileName = null;
        this.profileImage = null;
        userForm.reset();
        this.sendNotification(NotificationType.SUCCESS, `${response.firstName} ${response.lastName} added successfully`);
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
        this.profileImage = null;
      }
    )
    );
  } 

  public onUpdateUser(): void {
    const formData = this.userService.createUserFormData(this.currentUsername, this.editUser, this.profileImage);
    this.subscriptions.push(
    this.userService.updateUser(formData).subscribe(
      (response: User) => {
        this.clickButton('closeEditUserModalButton');
        this.getUsers(false);
        this.fileName = null;
        this.profileImage = null;
        this.sendNotification(NotificationType.SUCCESS, `${response.firstName} ${response.lastName} updated successfully`);
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
      }
    )
    );
  }

  public searchUsers(searchTerm: string): void {
    const results: User[] = []; 
    for (const user of this.userService.getUsersFromLocalCache()) {
      if (user.firstName.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||
          user.lastName.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||
          user.username.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||
          user.userId.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1) {
            results.push(user)
      }
    }
    this.users= results;
    if (results.length == 0 || !searchTerm) {
      this.users = this.userService.getUsersFromLocalCache();
    }
  }

  public onResetPassword(resetForm: NgForm): void {
    const formData = this.userService.createUserPassFormData(resetForm.value["reset-password-username"], resetForm.value["reset-password-current-pass"], resetForm.value["reset-password-new-pass"]);
    this.refreshing = true;
    this.subscriptions.push(
      this.userService.resetPassword(formData).subscribe(
        (response: User) => {
          this.sendNotification(NotificationType.SUCCESS, `${response.username} password update successfully`);
          this.refreshing = false;
        },
        (errorResponse: HttpErrorResponse) => {
          this.sendNotification(NotificationType.WARNING, errorResponse.error.message);
          this.refreshing = false;
        },
        () => resetForm.reset()
      )
    );
  }

  public onDeleteUser(userId: number): void {
    this.subscriptions.push(
      this.userService.deleteUser(userId).subscribe(
        (response: CustomHttpResponse) => {
          this.sendNotification(NotificationType.SUCCESS, response.message);
          this.getUsers(false);
        },
        (errorResponse: HttpErrorResponse) => {
          this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
        }
      )
    )
  }

  public onEditUser(editUser: User): void {
    this.editUser = editUser;
    this.currentUsername = editUser.username;
    this.clickButton('openUserEdit');
  }

  private sendNotification(notificationType: NotificationType, message: string): void {
    if(message){
      this.notificationService.showNotification(notificationType, message);
    }
    else {
      this.notificationService.showNotification(notificationType, "An error occured. Please try again.")
    }
  }

  private clickButton(buttonId: string): void {
    document.getElementById(buttonId).click()
  }


  

}
