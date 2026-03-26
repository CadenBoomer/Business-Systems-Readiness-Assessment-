import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';

// Router — goes in the constructor, it's the service that lets you navigate programmatically in your 
// TypeScript code:

// RouterModule — goes in the imports array of the component decorator, it's what makes router
//  directives available in your HTML template:

@Component({
  selector: 'app-assessment',
  imports: [RouterModule],
  templateUrl: './assessment.html',
  styleUrl: './assessment.css',
})
export class Assessment {

  currentIndex = 0;
  selectedAnswer: string = '';
  answers: { [key: string]: string } = {};

  //  currentIndex — tracks which question you're on, starts at 0
  // selectedAnswer — stores the currently selected option (A/B/C/D), empty string by default
  // answers: { [key: string]: string } — an object that stores all answered questions. The [key: string] part means any string can be a key. So it builds up like:

  questions = [

    // An array of 12 objects. Each object has:

    // question — the question text string
    // options — array of 4 objects, each with a label (display text) and value (A/B/C/D)
    {

      question: 'How clearly defined is your primary offer?',
      options: [
        { label: "A. I'm still refining what I sell.", value: 'A' },
        { label: 'B. I have multiple offers but no clear primary focus.', value: 'B' },
        { label: 'C. I have one clear primary offer and CTA.', value: 'C' },
        { label: 'D. I have one primary offer with defined positioning and proof (testimonials/results).', value: 'D' }

      ]
    },
    {
      question: 'What best describes your online presence?',
      options: [
        { label: 'A. No structured website.', value: 'A' },
        { label: 'B. Basic website with limited conversion structure.', value: 'B' },
        { label: 'C. Structured website with clear conversion path.', value: 'C' },
        { label: 'D. Website + targeted landing pages aligned to offers.', value: 'D' }
      ]
    },
    {
      question: 'How are leads captured?',
      options: [
        { label: 'A. Manual inquiries (email/DM).', value: 'A' },
        { label: 'B. Basic contact form or booking link.', value: 'B' },
        { label: 'C. Form/booking with automated confirmations.', value: 'C' },
        { label: 'D. Multi-step qualification (forms, conversational AI, funnels).', value: 'D' }
      ]
    },
    {
      question: 'How structured is your CRM and customer journey?',
      options: [
        { label: 'A. Inbox or spreadsheet tracking.', value: 'A' },
        { label: 'B. CRM exists but inconsistent use.', value: 'B' },
        { label: 'C. Defined customer journey stages with consistent usage.', value: 'C' },
        { label: 'D. Lifecycle stages + segmentation + reporting.', value: 'D' }
      ]
    },
    {
      question: 'What follow-up happens after inquiry?',
      options: [
        { label: 'A. Manual replies only.', value: 'A' },
        { label: 'B. Templates but no automation.', value: 'B' },
        { label: 'C. Automated confirmations + reminders.', value: 'C' },
        { label: 'D. Multi-step nurture sequences tied to customer journey stages.', value: 'D' }
      ]
    },
    {
      question: 'How standardized is client onboarding and fulfillment?',
      options: [
        { label: 'A. Varies each time.', value: 'A' },
        { label: 'B. Manual checklist but inconsistent.', value: 'B' },
        { label: 'C. Structured onboarding workflow.', value: 'C' },
        { label: 'D. Automated lifecycle transitions (onboarding → fulfillment → retention).', value: 'D' }
      ]
    },
    {
      question: 'How are payments and offers handled?',
      options: [
        { label: 'A. Manual invoicing only.', value: 'A' },
        { label: 'B. Online payments but limited automation.', value: 'B' },
        { label: 'C. Integrated checkout with confirmation workflows.', value: 'C' },
        { label: 'D. Subscriptions, order bumps, automated payment workflows.', value: 'D' }
      ]
    },
    {
      question: 'Do you actively monetize your existing database?',
      options: [
        { label: 'A. No reactivation efforts.', value: 'A' },
        { label: 'B. Occasional manual outreach.', value: 'B' },
        { label: 'C. Structured reactivation campaigns.', value: 'C' },
        { label: 'D. Automated lifecycle-based reactivation + Outreach AI.', value: 'D' }
      ]
    },
    {
      question: 'How do you generate and manage reviews?',
      options: [
        { label: 'A. No review system.', value: 'A' },
        { label: 'B. Manual requests occasionally.', value: 'B' },
        { label: 'C. Structured review request workflow.', value: 'C' },
        { label: 'D. Automated Reviews AI with follow-up and response workflows.', value: 'D' }
      ]
    },
    {
      question: 'How are AI tools used in your engagement process?',
      options: [
        { label: 'A. No AI tools in use.', value: 'A' },
        { label: 'B. AI tools installed but not integrated.', value: 'B' },
        { label: 'C. AI tools integrated into workflows (qualification, reminders).', value: 'C' },
        { label: 'D. AI voice/conversational agents driving engagement at scale.', value: 'D' }
      ]
    },
    {
      question: 'How do you track and improve performance?',
      options: [
        { label: 'A. I do not consistently track metrics.', value: 'A' },
        { label: 'B. I check results occasionally but no structured review.', value: 'B' },
        { label: 'C. I review dashboards regularly and adjust workflows.', value: 'C' },
        { label: 'D. I track lifecycle performance, attribution, and optimize continuously.', value: 'D' }
      ]
    },
    {
      question: 'How do you increase revenue from existing clients?',
      options: [
        { label: 'A. No structured retention strategy.', value: 'A' },
        { label: 'B. Occasional manual upsell offers.', value: 'B' },
        { label: 'C. Planned follow-up offers or renewal reminders.', value: 'C' },
        { label: 'D. Automated retention, renewal, and expansion workflows.', value: 'D' }
      ]
    }
  ];

  get currentQuestion() {
    return this.questions[this.currentIndex];
  }

  // A getter — it's like a property that runs a function when accessed. Every time the template uses 
  // currentQuestion it automatically returns whichever question matches the current index. So when currentIndex
  // is 2 it returns questions[2].

  constructor(private router: Router) { }

  selectAnswer(value: string) {
    this.selectedAnswer = value;
  }

  // Called when a user clicks an answer button. Just sets selectedAnswer to whatever letter was clicked 
  // (A/B/C/D). The template then uses selectedAnswer to apply the selected CSS class to the right button.

  nextQuestion() {
    this.answers['q' + (this.currentIndex + 1)] = this.selectedAnswer;

    // First thing it does is save the current answer.So if you're on question 3 (currentIndex = 2) it saves:
    // typescriptanswers['q3'] = 'B'

    if (this.currentIndex === this.questions.length - 1) {
      // All questions done, go to email gate
      this.router.navigate(['/email-gate'], {
        state: { responses: this.answers }
      });
      // If you're on the last question, navigate to the email gate page. The state part passes the answers 
      // object along to the next page so it doesn't get lost. state is like a hidden bag of data you carry 
      // between routes.
    } else {
      this.currentIndex++;
      this.selectedAnswer = this.answers['q' + (this.currentIndex + 1)] || '';

      // If not the last question:
      // currentIndex++ — moves to the next question
      // Then it checks if that question already has an answer (in case the user went back). If it does it pre-selects it, if not it defaults to empty string ''
    }
  }

}

