import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-progress-tracker',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, RouterLinkActive],
  templateUrl: './progress-tracker.component.html',
  styleUrl: './progress-tracker.component.css'
})
export class ProgressTrackerComponent {
  currentDistance = 600;
  currentElevation = 100
  goals = [{ title: "Cycle Across the US", startDate: null, targetDate: null, metric: "distance", startValue: 0, targetValue: 1000 }];

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
