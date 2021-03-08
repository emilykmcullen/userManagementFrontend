import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { HeaderType } from '../enum/header-type.enum';
import { NotificationType } from '../enum/notification-type.enum';
import { User } from '../models/user';
import { AuthenticationService } from '../service/authentication.service';
import { NotificationService } from '../service/notification.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  public showLoading: boolean;
  private subscriptions: Subscription[] = [];

  constructor(private router: Router, private authenticationService: AuthenticationService, 
              private notificationService: NotificationService) { }

  ngOnInit(): void {
    if(this.authenticationService.isLoggedIn()){
      this.router.navigateByUrl('/user/management');
    }
    else {
      this.router.navigateByUrl('/login');
    }
  }

  public onLogin(user: User): void {
    this.showLoading = true;
    console.log(user);
    this.subscriptions.push(
      //subscribe will wait for the observable in the auth service login method
      //to fire, reach out to the server, and get the response back
      this.authenticationService.login(user).subscribe(
        //if the http request is successful and a user object is returned in the response
        (response: HttpResponse<User>) => {
          const token = response.headers.get(HeaderType.JWT_TOKEN);
          //saves token in local storage in the browser
          this.authenticationService.saveToken(token);
          this.authenticationService.addUserToLocalCache(response.body);
          this.router.navigateByUrl('/user/management');
          this.showLoading = false;
        },
        (errorResponse: HttpErrorResponse) => {
          console.log(errorResponse);
          this.sendErrorNotification(NotificationType.ERROR, errorResponse.error.message);
          this.showLoading = false;
        }
      )
    );
  }
  private sendErrorNotification(notificationType: NotificationType, message: string): void {
    if(message){
      this.notificationService.showNotification(notificationType, message);
    }
    else {
      this.notificationService.showNotification(notificationType, "An error occured. Please try again.")
    }
  }

  ngOnDestroy(): void{
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

}
