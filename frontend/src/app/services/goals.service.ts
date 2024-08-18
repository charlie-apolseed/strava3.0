import { Injectable } from '@angular/core';
import { WebService } from './web.service';
import Goal from '../models/goal';

@Injectable({
  providedIn: 'root'
})
export class GoalsService {

  constructor(private webService: WebService) {
  }

  addNewGoal(newGoal: Goal) {
    console.log("goalsService sending:", newGoal);  // Log the object separately
    return this.webService.post('goals', newGoal);
  }
}
