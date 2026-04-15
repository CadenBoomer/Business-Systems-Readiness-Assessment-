import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {

  username: string = '';
  password: string = '';
  error: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(private router: Router, private http: HttpClient, private cdr: ChangeDetectorRef) { }

  login() {
    this.http.post<any>('https://api.assessment.thewebsitemembership.com/api/admin/login', {
      username: this.username,
      password: this.password
    }).subscribe({
      next: (res) => {
        localStorage.setItem('admin_token', res.token);
        this.router.navigate(['/admin/dashboard']);
      },
      error: () => {
        this.errorMessage = 'Invalid username or password';
        this.cdr.detectChanges();
      }
    });
  }
}