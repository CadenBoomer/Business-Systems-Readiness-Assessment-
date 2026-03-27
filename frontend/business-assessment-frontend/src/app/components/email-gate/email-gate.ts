import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-email-gate',
  imports: [FormsModule],
  templateUrl: './email-gate.html',
  styleUrl: './email-gate.css',
})
export class EmailGate {

  firstName: string = '';
  lastName: string = '';
  email: string = '';
  consent: boolean = false;
  responses: { [key: string]: string } = {};
  isLoading: boolean = false;

  // These are the component's properties:

  // First three are strings that stay in sync with the input fields via [(ngModel)]
  // consent is a boolean — true or false depending on checkbox
  // responses — the answers object passed from the assessment component { q1: 'A', q2: 'C' ... }
  // isLoading — tracks whether the API call is in progress. You could use this to show a loading spinner on the 
  // button while waiting for the backend

  constructor(private router: Router, private http: HttpClient) {

    // Grab the responses passed from the assessment component
    const state = history.state;
    if (state?.responses) {
      this.responses = state.responses;
    }
  }

  // private router: Router — injects the router so you can navigate
  // private http: HttpClient — injects HttpClient so you can make API calls
  // history.state — grabs the state that was passed when navigating from the assessment component. Remember 
  // when you called router.navigate(['/email-gate'], { state: { responses: this.answers } })? That data is now 
  // in history.state 
  // state?.responses — the ? is optional chaining. Means "if state exists, check for responses — if not don't 
  // crash"

  isFormValid(): boolean {
    return this.firstName.trim() !== '' &&
      this.lastName.trim() !== '' &&
      this.email.trim() !== '' &&
      this.consent;
  }

  // Returns true only if ALL conditions are met:

  // .trim() removes whitespace — so someone typing spaces wouldn't count as valid
  // !== '' checks the field isn't empty
  // && means ALL conditions must be true
  // this.consent at the end checks the checkbox is ticked — since it's already a boolean you don't 
  // need === true, just the variable itself

  submitForm() {
    if (!this.isFormValid()) return;
    this.isLoading = true;

    //     Double checks form is valid before doing anything — safety net
    // Sets isLoading to true so you can show a loading state on the button

    const payload = {
      first_name: this.firstName,
      last_name: this.lastName,
      email: this.email,
      responses: this.responses,
    };

    // Builds the object to send to your backend. Packages up all the form data and the assessment responses into one 
    // object.
    //Uses _ to match the backend variables



    this.http.post<any>('http://localhost:3000/api/submit-assessment', payload)
      .subscribe({
        next: (response) => {
          this.router.navigate(['/results'], {
            state: { results: response }
          });
        },
        error: (err) => {
          console.error(err);
          this.isLoading = false;
        }
      });
  }
}



// This is the actual API call. Breaking it down:

// this.http.post<any> — makes a POST request to your backend. <any> means you're not strictly typing the 
// response
// The URL http://localhost:3000/api/submit-assessment is your backend endpoint
// .subscribe() — HttpClient returns an Observable, not a Promise. You have to subscribe to it to actually 
// trigger the request and handle the response. Think of it like .then() on a Promise but Angular's version
// next — runs when the request succeeds. Takes the response and navigates to /results passing the results 
// as state
// error — runs if the request fails. Logs the error and turns off the loading state
