import { Routes } from '@angular/router';
import { Assessment } from './components/assessment/assessment';
import { EmailGate } from './components/email-gate/email-gate';
import { Results } from './components/results/results';
import { LoginComponent } from './admin/login/login';
import { Dashboard } from './admin/dashboard/dashboard';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    {path: '', component: Assessment},
    {path: 'email-gate', component: EmailGate},
    {path: 'results', component: Results},
    {path: 'admin/login', component: LoginComponent},
    { path: 'admin/dashboard', component: Dashboard, canActivate: [authGuard] },
    {path: '**', redirectTo: ''}

];


// The canActivate: [authGuard] on the dashboard route means Angular will run the guard 
// before loading the page. If no token is found it redirects to login.