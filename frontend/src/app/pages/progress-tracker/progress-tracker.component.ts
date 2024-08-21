import { Component, ElementRef, Inject, PLATFORM_ID, ViewChild } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import Goal from '../../models/goal';
import { FormsModule } from '@angular/forms';
import { GoalsService } from '../../services/goals.service';
import { HttpErrorResponse } from '@angular/common/http';
import { LabelType, Options, NgxSliderModule } from '@angular-slider/ngx-slider';

@Component({
  selector: 'app-progress-tracker',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, RouterLinkActive, NgxSliderModule, FormsModule],
  templateUrl: './progress-tracker.component.html',
  styleUrl: './progress-tracker.component.css'
})
export class ProgressTrackerComponent {
  @ViewChild('closeBtn') closeBtn!: ElementRef;
  isBrowser: boolean;
  currentDistance = 600;
  currentElevation = 100;
  allGoals: Goal[] = [];
  activeGoals: Goal[] = [];

  newGoalSectionDisplayed: boolean = false;
  newGoalTitle = "";
  newGoalMetricLabel: string = "Select Metric";
  newGoalMetric: string = "";
  newGoalDateLabel: string = "Select Target Date";
  newGoalDate: string = "";
  newGoalTargetValue: number = 0;
  
 


  constructor(private goalService: GoalsService, @Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  addNewGoal(): void {
    let newGoal = new Goal("Cycle Across the US", "", "", 0, 1000, "distance", false);
    this.goalService.addNewGoal(newGoal).subscribe({
      next: (response) => {
        console.log(response);
      },
      error: (error) => {
        console.error('Update failed', error);
        if (error instanceof HttpErrorResponse && error.error instanceof SyntaxError) {
          console.error('The server returned an invalid JSON:', error.message);
        } else {
          console.error('An unexpected error occurred:', error.message);
        }
      }
    });
  }

  saveNewGoal(): void {
    this.closeBtn.nativeElement.click();
  }

  resetNewGoalFields(): void {
    this.newGoalMetricLabel = "Select Metric";
    this.newGoalMetric = "";
    this.newGoalDateLabel = "Select Target Date";
    this.newGoalDate = "";
  }

  setNewGoalMetric(metric: string) {
    this.newGoalMetric = metric;
    this.newGoalMetricLabel = metric;
  }

  setNewGoalDate(date: string) {
    this.newGoalDate = date;
    this.newGoalDateLabel = date;
  }

 






  getAllGoals(): void {
    this.goalService.getAllGoals().subscribe(goals => {
      console.log("Got all goals: ")
      this.allGoals = goals;
      console.log(this.allGoals);
    });
  }

  getActiveGoals(): void {
    this.activeGoals = [];
    for (let i = 0; i < this.allGoals.length; i++) {
      if (!this.allGoals[i].completed) {
        this.activeGoals.push(this.allGoals[i]);
      }
    }
    console.log("Got active goals: ");
    console.log(this.activeGoals);
  }

  getProgress(goalIdx: number): number {
    const selectedGoal = this.activeGoals[goalIdx];
    const goalDifference = selectedGoal.targetValue - selectedGoal.startValue;
    let progress = 0;
    if (selectedGoal.metric == "distance") {
      progress = (this.currentDistance - selectedGoal.startValue) / goalDifference * 100;
    } else if (selectedGoal.metric == "elevation") {
      progress = (this.currentElevation - selectedGoal.startValue) / goalDifference * 100;
    }
    return progress;
  }

  displayNewGoalForm() {

    this.newGoalSectionDisplayed = !this.newGoalSectionDisplayed;
  }


}