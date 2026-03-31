import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

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

  constructor(private router: Router, private http: HttpClient) {}

  login() {
    if (!this.username || !this.password) return;
    this.isLoading = true;
    this.error = '';

    this.http.post<any>('http://localhost:3000/api/admin/login', {
      username: this.username,
      password: this.password
    }).subscribe({
      next: (response) => {
        localStorage.setItem('admin_token', response.token);
        this.router.navigate(['/admin/dashboard']);
      },
      error: (err) => {
        this.error = 'Invalid username or password';
        this.isLoading = false;
      }
    });
  }
}