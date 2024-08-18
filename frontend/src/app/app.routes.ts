import { Routes } from '@angular/router';
import { ActivitiesListComponent } from './pages/activities-list/activities-list.component';
import { ProgressTrackerComponent } from './pages/progress-tracker/progress-tracker.component';

export const routes: Routes = [ {path: 'activities', component: ActivitiesListComponent}, {path: 'progress', component: ProgressTrackerComponent}];
