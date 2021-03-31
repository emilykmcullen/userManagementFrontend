import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpEvent, HttpResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { User } from '../models/user';
import { JwtHelperService } from "@auth0/angular-jwt";
import { CustomHttpResponse } from '../models/custom-http-response';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private host = environment.apiUrl;

  constructor(private http: HttpClient) {}

  public getUsers(): Observable<User[] | HttpErrorResponse>{
    return this.http.get<User[]>(`${this.host}/user/list`);
  }

  public addUser(formData: FormData): Observable<User | HttpErrorResponse>{
    return this.http.post<User>(`${this.host}/user/add`, formData);
  }

  public updateUser(formData: FormData): Observable<User | HttpErrorResponse>{
    return this.http.post<User>(`${this.host}/user/update`, formData);
  }

  public resetPassword(formData: FormData): Observable<User> {
    return this.http.post<User>(`${this.host}/user/resetPassword`, formData);
  }

  public updateProfileImage(formData: FormData): Observable<HttpEvent<any> | HttpErrorResponse>{
    return this.http.post<User>(`${this.host}/user/updateProfileImage`, formData, 
    {reportProgress: true,
      observe: 'events',
    });
  }

  public deleteUser(username: string): Observable<CustomHttpResponse | HttpErrorResponse>{
    return this.http.delete<CustomHttpResponse>(`${this.host}/user/delete/${username}`);
  }

  public addUsersToLocalCache(users: User[]): void{
    localStorage.setItem('users', JSON.stringify(users));
  }

  public getUsersFromLocalCache(): User[] {
    if(localStorage.getItem('users')){
      return JSON.parse(localStorage.getItem('users'));
    };
    return null;
  }

  public createUserFormData(loggedInUsername: string, user: User, profileImage: File): FormData {
    const formData = new FormData();
    formData.append('currentUsername', loggedInUsername);
    formData.append('firstName', user.firstName);
    formData.append('lastName', user.lastName);
    formData.append('username', user.username);
    formData.append('email', user.email);
    formData.append('profileImage', profileImage);
    formData.append('isActive', JSON.stringify(user.active));
    formData.append('isNotLocked', JSON.stringify(user.notLocked));
    return formData;
  }

  public createUserPassFormData(loggedInUsername: string, currentPass: string, newPass: string ): FormData {
    const formData = new FormData();
    formData.append('currentUsername', loggedInUsername);
    formData.append('currentPassword', currentPass);
    formData.append('newPassword', newPass);
    return formData;
  }
}
