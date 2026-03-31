import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-results',
  imports: [CommonModule],
  templateUrl: './results.html',
  styleUrl: './results.css',
})
export class Results {

  results: any = null;

  submissionId: number | null = null;

  pathway: string = '';
  reasoning: string = '';
  confidenceScore: number = 0;
  summary: string = '';
  priorityActions: string[] = [];
  antiPriorityWarnings: string[] = [];
  graduationOutlook: string = '';

  // Declaring all the properties with default values:

  // results: any = null — stores the full raw response object
  // submissionId: number | null = null — the | null means it can be either a number OR null. Starts as null until data loads
  // string[] = [] — empty array of strings for the list fields. The [] after string means array of strings
  // number = 0 — confidence score starts at 0


  constructor(private router: Router, private http: HttpClient) {

    const state = history.state;
    if (state?.results) {
      this.results = state.results;
      this.submissionId = state.results.submission_id;
      this.pathway = state.results.pathway;
      this.reasoning = state.results.reasoning;
      this.confidenceScore = state.results.confidence_score;
      this.summary = state.results.summary;
      this.priorityActions = state.results.priority_actions;
      this.antiPriorityWarnings = state.results.anti_priority_warnings;
      this.graduationOutlook = state.results.graduation_outlook;

    }
  }

// Same history.state pattern as email gate — grabs the results passed from the email gate component
// state?.results — checks if results exists before trying to access it
// Then each property gets assigned its value from the response
// state.results.submission_id uses underscore because that's what your backend returns — you then store it 
// in submissionId camelCase on the Angular side

// history.state is how Angular passes data between pages when you navigate.

  downloadPDF() {
    window.open(`http://localhost:3000/api/results/${this.submissionId}/pdf`, '_blank');
  }
}

// window.open — opens a URL in the browser
// The URL hits your PDF download endpoint with the submission id
// _blank — opens in a new tab instead of replacing the current page