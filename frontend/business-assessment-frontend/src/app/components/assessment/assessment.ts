import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

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
export class Assessment implements OnInit {

  currentIndex = 0;
  selectedAnswer: string = '';
  answers: { [key: string]: string } = {};
  isLoading: boolean = true;
  questions: any[] = [];

  //  currentIndex — tracks which question you're on, starts at 0
  // selectedAnswer — stores the currently selected option (A/B/C/D), empty string by default
  // answers: { [key: string]: string } — an object that stores all answered questions. The [key: string] part means any string can be a key. So it builds up like:

  constructor(private router: Router, private http: HttpClient, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.loadQuestions();
  }

  loadQuestions() {
    this.http.get<any[]>('https://assessment.thewebsitemembership.com/api/questions')
      .subscribe({
        next: (data) => {
          this.questions = data.map(q => ({
            question: q.question_text,
            options: q.options.map((o: any, index: number) => ({
              label: o.answer_text,
              value: ['A', 'B', 'C', 'D'][index]
            }))
          }));
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(err);
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  get currentQuestion() {
    return this.questions[this.currentIndex];
  }

  // A getter — it's like a property that runs a function when accessed. Every time the template uses 
  // currentQuestion it automatically returns whichever question matches the current index. So when currentIndex
  // is 2 it returns questions[2].


  selectAnswer(value: string) {
    this.selectedAnswer = value;
  }

  // Called when a user clicks an answer button. Just sets selectedAnswer to whatever letter was clicked 
  // (A/B/C/D). The template then uses selectedAnswer to apply the selected CSS class to the right button.


  previousQuestion() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.selectedAnswer = this.answers['q' + (this.currentIndex + 1)] || '';
    }
  }

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

