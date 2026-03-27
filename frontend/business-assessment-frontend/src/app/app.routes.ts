import { Routes } from '@angular/router';
import { Assessment } from './components/assessment/assessment';
import { EmailGate } from './components/email-gate/email-gate';
import { Results } from './components/results/results';

export const routes: Routes = [
    {path: '', component: Assessment},
    {path: 'email-gate', component: EmailGate},
    {path: 'results', component: Results},
    {path: '**', redirectTo: ''}

];
