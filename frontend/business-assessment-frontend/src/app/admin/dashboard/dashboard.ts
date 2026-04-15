import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit, OnDestroy {

  activeTab: string = 'questions';
  questions: any[] = [];
  submissions: any[] = [];

  // Question form
  editingQuestion: any = null;

  // Answer option form
  editingOption: any = null;

  settings: any[] = [];
  editingSetting: any = null;

  pathways: any[] = [];
  editingPathway: any = null;

  currentPage: number = 1;
  totalPages: number = 1;
  totalSubmissions: number = 0;

  currentPassword: string = '';
  newUsername: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  credentialsMessage: string = '';
  credentialsError: string = '';

  searchQuery: string = '';

  private tokenCheckInterval: any;

  constructor(private router: Router, private http: HttpClient, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.loadQuestions();
    this.loadSubmissions();
    this.loadSettings();
    this.loadPathways();
    this.startTokenCheck();
  }

  // Get JWT token from localStorage
  getHeaders() {
    const token = localStorage.getItem('admin_token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  // Logout
  logout() {
    localStorage.removeItem('admin_token');
    this.router.navigate(['/admin/login']);
  }

  loadSettings() {
    this.http.get<any[]>('https://api.assessment.thewebsitemembership.com/api/settings',
      { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.settings = data;
          this.cdr.detectChanges();
        },
        error: (err) => console.error(err)
      });
  }

  editSetting(setting: any) {
    this.editingSetting = { ...setting };
  }

  saveSetting() {
    if (!this.editingSetting) return;
    this.http.put('https://api.assessment.thewebsitemembership.com/api/settings',
      { setting_key: this.editingSetting.setting_key, setting_value: this.editingSetting.setting_value },
      { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          this.editingSetting = null;
          this.loadSettings();
        },
        error: (err) => console.error(err)
      });
  }

  loadPathways() {
    this.http.get<any[]>('https://api.assessment.thewebsitemembership.com/api/pathways',
      { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.pathways = data;
          this.cdr.detectChanges();
        },
        error: (err) => console.error(err)
      });
  }

  editPathway(pathway: any) {
    this.editingPathway = { ...pathway };
  }

  savePathway() {
    if (!this.editingPathway) return;
    this.http.put(`https://api.assessment.thewebsitemembership.com/api/pathways/${this.editingPathway.id}`,
      { description: this.editingPathway.description },
      { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          this.editingPathway = null;
          this.loadPathways();
        },
        error: (err) => console.error(err)
      });
  }
  // ── QUESTIONS ──────────────────────────────────────

  loadQuestions() {
    this.http.get<any[]>('https://api.assessment.thewebsitemembership.com/api/questions',
      { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.questions = data;
          this.cdr.detectChanges();
        },
        error: (err) => console.error(err)
      });
  }



  editQuestion(question: any) {
    this.editingQuestion = { ...question };
  }

  saveQuestion() {
    if (!this.editingQuestion) return;
    this.http.put(`https://api.assessment.thewebsitemembership.com/api/questions/${this.editingQuestion.id}`,
      { question_text: this.editingQuestion.question_text, display_order: this.editingQuestion.display_order },
      { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          this.editingQuestion = null;
          this.loadQuestions();
        },
        error: (err) => console.error(err)
      });
  }



  // ── ANSWER OPTIONS ─────────────────────────────────


  editOption(option: any) {
    this.editingOption = { ...option };
  }

  saveOption() {
    if (!this.editingOption) return;
    this.http.put(`https://api.assessment.thewebsitemembership.com/api/answers/${this.editingOption.id}`,
      { answer_text: this.editingOption.answer_text, display_order: this.editingOption.display_order },
      { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          this.editingOption = null;
          this.loadQuestions();
        },
        error: (err) => console.error(err)
      });
  }


  // ── SUBMISSIONS ────────────────────────────────────

  loadSubmissions() {
    this.http.get<any>(`https://api.assessment.thewebsitemembership.com/api/submissions?page=${this.currentPage}`,
      // Sends the current page number to the backend as a query parameter.
      { headers: this.getHeaders() })
      .subscribe({
        next: (data) => {
          this.submissions = data.submissions;
          this.currentPage = data.currentPage;
          this.totalPages = data.totalPages;
          this.totalSubmissions = data.total;
          // The backend now returns an object instead of just an array — so you extract the 
          // submissions array and the pagination info separately.
          this.cdr.detectChanges();
        },
        error: (err) => console.error(err)
      });
  }

  downloadSubmissionPDF(id: number) {
    window.open(`https://api.assessment.thewebsitemembership.com/api/results/${id}/pdf`, '_blank');
  }


  startTokenCheck() {
    // Check every 30 seconds if token is still valid
    this.tokenCheckInterval = setInterval(() => {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        this.router.navigate(['/admin/login']);
        return;
      }
      try {
        const decoded: any = jwtDecode(token);
        const isExpired = decoded.exp * 1000 < Date.now();
        if (isExpired) {
          localStorage.removeItem('admin_token');
          this.router.navigate(['/admin/login']);
        }
      } catch {
        localStorage.removeItem('admin_token');
        this.router.navigate(['/admin/login']);
      }
    }, 30000);
  }

  ngOnDestroy() {
    if (this.tokenCheckInterval) {
      clearInterval(this.tokenCheckInterval);
    }
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadSubmissions();
  }

  // Called when Prev or Next is clicked. The guard if (page < 1 || page > this.totalPages) 
  // prevents going beyond the first or last page. Then it updates the current page and reloads submissions.

  updateCredentials() {
    if (this.newPassword && this.newPassword !== this.confirmPassword) {
      this.credentialsError = 'New passwords do not match';
      return;
    }

    if (!this.currentPassword) {
      this.credentialsError = 'Current password is required';
      return;
    }

    this.http.put('https://api.assessment.thewebsitemembership.com/api/admin/credentials',
      {
        current_password: this.currentPassword,
        new_username: this.newUsername || undefined,
        new_password: this.newPassword || undefined
      },
      { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          this.credentialsMessage = 'Credentials updated successfully';
          this.credentialsError = '';
          this.currentPassword = '';
          this.newUsername = '';
          this.newPassword = '';
          this.confirmPassword = '';
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.credentialsError = err.error?.error || 'Something went wrong';
          this.credentialsMessage = '';
          this.cdr.detectChanges();
        }
      });
  }

  get filteredSubmissions() {
  if (!this.searchQuery) return this.submissions;
  const query = this.searchQuery.toLowerCase();
  return this.submissions.filter(s =>
    s.first_name.toLowerCase().includes(query) ||
    s.last_name.toLowerCase().includes(query) ||
    s.email.toLowerCase().includes(query)
  );
}

}