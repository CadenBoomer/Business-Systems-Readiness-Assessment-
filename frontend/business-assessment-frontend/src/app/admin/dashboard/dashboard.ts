import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  activeTab: string = 'questions';
  questions: any[] = [];
  submissions: any[] = [];

  // Question form
  newQuestion: string = '';
  newDisplayOrder: number = 0;
  editingQuestion: any = null;

  // Answer option form
  selectedQuestion: any = null;
  newOptionText: string = '';
  newOptionOrder: number = 0;
  editingOption: any = null;

  settings: any[] = [];
  editingSetting: any = null;

  constructor(private router: Router, private http: HttpClient) { }

  ngOnInit() {
    this.loadQuestions();
    this.loadSubmissions();
    this.loadSettings();
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
    this.http.get<any[]>('http://localhost:3000/api/settings',
      { headers: this.getHeaders() })
      .subscribe({
        next: (data) => this.settings = data,
        error: (err) => console.error(err)
      });
  }

  editSetting(setting: any) {
    this.editingSetting = { ...setting };
  }

  saveSetting() {
    if (!this.editingSetting) return;
    this.http.put('http://localhost:3000/api/settings',
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

  // ── QUESTIONS ──────────────────────────────────────

  loadQuestions() {
    this.http.get<any[]>('http://localhost:3000/api/questions',
      { headers: this.getHeaders() })
      .subscribe({
        next: (data) => this.questions = data,
        error: (err) => console.error(err)
      });
  }

  addQuestion() {
    if (!this.newQuestion) return;
    this.http.post('http://localhost:3000/api/questions',
      { question_text: this.newQuestion, display_order: this.newDisplayOrder },
      { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          this.newQuestion = '';
          this.newDisplayOrder = 0;
          this.loadQuestions();
        },
        error: (err) => console.error(err)
      });
  }

  editQuestion(question: any) {
    this.editingQuestion = { ...question };
  }

  saveQuestion() {
    if (!this.editingQuestion) return;
    this.http.put(`http://localhost:3000/api/questions/${this.editingQuestion.id}`,
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

  deleteQuestion(id: number) {
    if (!confirm('Are you sure you want to delete this question?')) return;
    this.http.delete(`http://localhost:3000/api/questions/${id}`,
      { headers: this.getHeaders() })
      .subscribe({
        next: () => this.loadQuestions(),
        error: (err) => console.error(err)
      });
  }

  // ── ANSWER OPTIONS ─────────────────────────────────

  selectQuestion(question: any) {
    this.selectedQuestion = question;
  }

  addOption() {
    if (!this.newOptionText || !this.selectedQuestion) return;
    this.http.post('http://localhost:3000/api/answer-options',
      { question_id: this.selectedQuestion.id, option_text: this.newOptionText, display_order: this.newOptionOrder },
      { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          this.newOptionText = '';
          this.newOptionOrder = 0;
          this.loadQuestions();
        },
        error: (err) => console.error(err)
      });
  }

  editOption(option: any) {
    this.editingOption = { ...option };
  }

  saveOption() {
    if (!this.editingOption) return;
    this.http.put(`http://localhost:3000/api/answer-options/${this.editingOption.id}`,
      { option_text: this.editingOption.option_text, display_order: this.editingOption.display_order },
      { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          this.editingOption = null;
          this.loadQuestions();
        },
        error: (err) => console.error(err)
      });
  }

  deleteOption(id: number) {
    if (!confirm('Are you sure you want to delete this option?')) return;
    this.http.delete(`http://localhost:3000/api/answer-options/${id}`,
      { headers: this.getHeaders() })
      .subscribe({
        next: () => this.loadQuestions(),
        error: (err) => console.error(err)
      });
  }

  // ── SUBMISSIONS ────────────────────────────────────

  loadSubmissions() {
    this.http.get<any[]>('http://localhost:3000/api/submissions',
      { headers: this.getHeaders() })
      .subscribe({
        next: (data) => this.submissions = data,
        error: (err) => console.error(err)
      });
  }

  downloadSubmissionPDF(id: number) {
    window.open(`http://localhost:3000/api/results/${id}/pdf`, '_blank');
  }

}