import { Injectable } from '@angular/core';
import { WebService } from './web.service';
import Goal from '../models/goal';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GoalsService {

  constructor(private webService: WebService) {
  }

  addNewGoal(newGoal: Goal) {
    return this.webService.post('goals', newGoal);
  }

  getAllGoals() {
    return this.webService.get('goals') as Observable<Goal[]>;
  }
}
