import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import Goal from '../../models/goal';
import { GoalsService } from '../../services/goals.service';

@Component({
  selector: 'app-progress-tracker',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, RouterLinkActive],
  templateUrl: './progress-tracker.component.html',
  styleUrl: './progress-tracker.component.css'
})
export class ProgressTrackerComponent {
  currentDistance = 600;
  currentElevation = 100;
  goals: Goal[] = [];
  
  
  constructor(private goalService: GoalsService) {}

  addNewGoal(): void {
    let newGoal = new Goal( "Cycle Across the US", "", "", 0, 1000, "distance");
    console.log("newGoal object:", newGoal);
    this.goalService.addNewGoal(newGoal);
  }

  getProgress(goalIdx: number): number {
    const selectedGoal = this.goals[goalIdx];
    const goalDifference = selectedGoal.targetValue - selectedGoal.startValue;
    let progress = 0;
    if (selectedGoal.metric == "distance") {
      progress = (this.currentDistance - selectedGoal.startValue) / goalDifference * 100;
    } else if (selectedGoal.metric == "elevation") {
      progress = (this.currentElevation - selectedGoal.startValue) / goalDifference * 100;
    }
    return progress;
  }
}
