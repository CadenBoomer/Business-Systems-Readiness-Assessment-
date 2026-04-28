import { Component, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-results',
  imports: [CommonModule],
  templateUrl: './results.html',
  styleUrl: './results.css',
})
export class Results implements OnInit, OnDestroy {

  results: any = null;

  submissionId: number | null = null;

  pathway: string = '';
  reasoning: string = '';
  confidenceScore: number = 0;
  summary: string = '';
  priorityActions: string[] = [];
  antiPriorityWarnings: string[] = [];
  graduationOutlook: string = '';

  ctaButtonText: string = 'Explore The Website Membership';
  ctaButtonUrl: string = 'https://thewebsitemembership.com';
  ctaDescription: string = 'Your full results report is attached as a PDF. Ready to take the next step?';

  narrativeReport: string = '';

  // Declaring all the properties with default values:

  // results: any = null — stores the full raw response object
  // submissionId: number | null = null — the | null means it can be either a number OR null. Starts as null until data loads
  // string[] = [] — empty array of strings for the list fields. The [] after string means array of strings
  // number = 0 — confidence score starts at 0

  // Streaming state
  isStreaming: boolean = false;
  streamingNarrative: string = '';
  statusMessage: string = '';
  isComplete: boolean = false;
  private eventSource: EventSource | null = null;

  hasError: boolean = false;

  // isStreaming — true while data is still coming in, used to show spinner
  // streamingNarrative — builds up word by word as Claude sends chunks
  // statusMessage — shows messages like "Analysing your responses..."
  // isComplete — true when everything is done, used to show download button
  // eventSource — kept for cleanup in ngOnDestroy even though we use fetch

  constructor(public router: Router, private http: HttpClient, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    
    const state = history.state;

    if (state?.streaming && state?.payload) {
      this.isStreaming = true;
      this.startStream(state.payload);
    } else if (state?.results) {
      // old flow
      this.loadFromResults(state.results);
    } else {
      const hadError = sessionStorage.getItem('hasError');
      if (hadError) {
        this.hasError = true;

      }
    }

    this.loadSettings();
  }

  loadFromResults(results: any) {
    this.submissionId = results.submission_id;
    this.pathway = results.pathway;
    this.reasoning = results.reasoning;
    this.confidenceScore = results.confidence_score;
    this.summary = results.summary;
    this.priorityActions = results.priority_actions;
    this.antiPriorityWarnings = results.anti_priority_warnings;
    this.graduationOutlook = results.graduation_outlook;
    this.narrativeReport = results.narrative_report;
  }

  // Uses fetch instead of HttpClient because streaming requires reading the response body as it 
  // arrives, which fetch handles natively. Sends a POST with the user's form data.
  startStream(payload: any) {
    // Use fetch with streaming instead of EventSource since we need POST
    fetch('https://api.assessment.thewebsitemembership.com/api/submit-assessment-stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(response => {
      if (!response.ok) {
        this.showError();
        return;
      }
      // reader — reads the response body chunk by chunk
      // decoder — converts raw bytes into text
      // buffer — holds incomplete lines between chunks since SSE events can split across chunks

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      // This is a recursive function — it reads one chunk, processes it, then calls itself again 
      // to read the next chunk. Keeps going until done is true. The buffer trick handles cases where a 
      // chunk ends mid-line.
      const read = () => {
        reader.read().then(({ done, value }) => {
          if (done) {
            this.isStreaming = false;
            this.isComplete = true;
            this.cdr.detectChanges();
            return;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('event:')) {
              // handled with next data line
            } else if (line.startsWith('data:')) {

              try {
                const data = JSON.parse(line.slice(5).trim());
                this.handleStreamEvent(data);
              } catch (e) {
                // skip malformed

              }
            }
          }

          read();
        });
      };

      read();
    }).catch(err => {
      this.showError();
      this.isStreaming = false;
      this.cdr.detectChanges();
    });
  }

  // processing each event
  handleStreamEvent(data: any) {

    if (data.submission_id) {
      // Complete event — check this FIRST
      this.submissionId = data.submission_id;
      this.summary = data.summary;
      this.narrativeReport = this.streamingNarrative;
      this.isComplete = true;
      this.isStreaming = false;
      sessionStorage.setItem('results', JSON.stringify({
        submission_id: data.submission_id,
        pathway: this.pathway,
        reasoning: this.reasoning,
        confidence_score: this.confidenceScore,
        summary: data.summary,
        priority_actions: this.priorityActions,
        anti_priority_warnings: this.antiPriorityWarnings,
        graduation_outlook: this.graduationOutlook,
        narrative_report: this.streamingNarrative
      }));
    } else if (data.message) {
      // Status event
      this.statusMessage = data.message;
    } else if (data.pathway) {
      // ML results event
      this.pathway = data.pathway;
      this.reasoning = data.reasoning;
      this.confidenceScore = data.confidence_score;
      this.priorityActions = data.priority_actions;
      this.antiPriorityWarnings = data.anti_priority_warnings;
      this.graduationOutlook = data.graduation_outlook;
    } else if (data.text) {
      // Narrative chunk event
      this.streamingNarrative += data.text;
    } else if (data.error) {
      // Error event from backend
      this.showError();
    }

    this.cdr.detectChanges();
  }

  // Uses whichever is available — streamingNarrative during streaming, 
  // narrativeReport for the old flow. Converts markdown to HTML using marked.

  get narrativeProse(): string {
    const text = this.streamingNarrative || this.narrativeReport;
    if (!text) return '';
    // Get everything before the first bullet point
    const bulletIndex = text.indexOf('•');
    if (bulletIndex === -1) return text;
    return text.substring(0, bulletIndex).trim();
  }

  get narrativeBullets(): string[] {
    const text = this.streamingNarrative || this.narrativeReport;
    if (!text) return [];
    // Extract bullet points
    const bulletIndex = text.indexOf('•');
    if (bulletIndex === -1) return [];
    const bulletSection = text.substring(bulletIndex);
    return bulletSection
      .split('\n')
      .filter(line => line.trim().startsWith('•'))
      .map(line => line.replace('•', '').trim());
  }


  downloadPDF() {
    window.open(`https://api.assessment.thewebsitemembership.com/api/results/${this.submissionId}/pdf`, '_blank');

  }

  loadSettings() {
    this.http.get<any[]>('https://api.assessment.thewebsitemembership.com/api/settings')
      .subscribe({
        next: (settings) => {

          settings.forEach(setting => {
            if (setting.setting_key === 'cta_button_text') this.ctaButtonText = setting.setting_value;
            if (setting.setting_key === 'cta_button_url') this.ctaButtonUrl = setting.setting_value;
            if (setting.setting_key === 'cta_description') this.ctaDescription = setting.setting_value;
          });
          this.cdr.detectChanges();
        },
      });
  }

  // Cleanup — closes the event source if the user navigates away before streaming completes. Prevents memory leaks.
  ngOnDestroy() {
    if (this.eventSource) {
      this.eventSource.close();
    }
  }

  showError() {
    this.hasError = true;
    this.isStreaming = false;
    this.isComplete = false;
    this.cdr.detectChanges();
  }

  retry() {
    this.router.navigate(['/email-gate'], {
      state: { responses: {} }
    });
  }

  get hasNarrative(): boolean {
    return !!(this.streamingNarrative || this.narrativeReport);
  }

}

// Same history.state pattern as email gate — grabs the results passed from the email gate component
// state?.results — checks if results exists before trying to access it
// Then each property gets assigned its value from the response
// state.results.submission_id uses underscore because that's what your backend returns — you then store it
// in submissionId camelCase on the Angular side

// history.state is how Angular passes data between pages when you navigate.

// window.open — opens a URL in the browser
// The URL hits your PDF download endpoint with the submission id
// _blank — opens in a new tab instead of replacing the current page



// Old flow:
// Submit → wait 15 seconds → see everything at once

// New flow:
// Submit → navigate immediately → see spinner
// → ML responds (2-3 sec) → pathway badge appears
// → Claude starts → narrative appears word by word
// → Complete → download button appears