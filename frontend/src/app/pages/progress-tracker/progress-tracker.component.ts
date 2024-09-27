import { Component, ElementRef, Inject, PLATFORM_ID, ViewChild } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import Goal from '../../models/goal';
import { FormsModule } from '@angular/forms';
import { GoalsService } from '../../services/goals.service';
import { HttpErrorResponse } from '@angular/common/http';
import { LabelType, Options, NgxSliderModule } from '@angular-slider/ngx-slider';
import { ActivitiesService } from '../../services/activities.service';
import Activity from '../../models/activity';


@Component({
  selector: 'app-progress-tracker',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, RouterLinkActive, NgxSliderModule, FormsModule],
  templateUrl: './progress-tracker.component.html',
  styleUrls: ['./progress-tracker.component.css']
})
export class ProgressTrackerComponent {
  @ViewChild('closeBtn') closeBtn!: ElementRef;
  isBrowser: boolean;

  allTimeDistance = 0;
  allTimeElevation = 0;
  allTimeActivities = 0;
  allTimeTime = 0;
  oneMonthAgoDistance = 0;
  oneMonthAgoTime = 0;
  oneMonthAgoElevation = 0;
  oneMonthAgoActivities = 0;

  allActivities : Activity[] = []
  allGoals: Goal[] = [
    {title: "Sample Goal 1",
    startDate: "10/10/10",
    targetDate: "11/11/11",
    startValue: 0,
    targetValue: 1000,
    metric: "Elevation",
    completed: false}, 
    {title: "Sample Goal 2",
      startDate: "10/10/10",
      targetDate: "11/11/11",
      startValue: 0,
      targetValue: 2000,
      metric: "Distance",
      completed: false}];
  activeGoals: Goal[] = [ {title: "Sample Goal 1",
    startDate: "10/10/10",
    targetDate: "11/11/11",
    startValue: 0,
    targetValue: 1000,
    metric: "Elevation",
    completed: false}, 
    {title: "Sample Goal 2",
      startDate: "10/10/10",
      targetDate: "11/11/11",
      startValue: 0,
      targetValue: 2000,
      metric: "Distance",
      completed: false}];

  newGoalSectionDisplayed: boolean = false;
  newGoalTitle = "";
  newGoalMetricLabel: string = "Select Metric";
  newGoalMetric: string = "";
  newGoalDateLabel: string = "Select Target Date";
  newGoalDate: string = "";
  newGoalTargetValue: number = 0;
  
  
 


  constructor(private goalService: GoalsService, private activitiesService: ActivitiesService, @Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  async ngOnInit(): Promise<void> {
    this.activitiesService.uploadActivitiesToDatabase().subscribe({
      next: (response: any) => {
        console.log("Activities successfully updated");
      },
      error: (error: any) => {
        console.error('Update failed', error);
        if (error instanceof HttpErrorResponse && error.error instanceof SyntaxError) {
          console.error('The server returned an invalid JSON:', error.message);
        } else {
          console.error('An unexpected error occurred:', error.message);
        }
      }      
    });
    this.activitiesService.getAllActivities().subscribe(activities => {
      this.allActivities = activities;
      this.allActivities.sort(this.dateComparator);
      console.log("Successfully got " + this.allActivities.length + " activities")
    })
    this.getAllTimeTotals();
    this.getAllGoals();
    this.getActiveGoals(); 
  }

  addNewGoal(): void {
    let newGoal = new Goal("Cycle Across the US", "10/10/10", "11/11/11", 0, 1000, "distance", false);
    this.goalService.addNewGoal(newGoal).subscribe({
      next: (response) => {
        this.getAllGoals()
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
      progress = (this.allTimeDistance - selectedGoal.startValue) / goalDifference * 100;
    } else if (selectedGoal.metric == "elevation") {
      progress = (this.allTimeElevation - selectedGoal.startValue) / goalDifference * 100;
    } 
    return progress;
  }

  displayNewGoalForm() {

    this.newGoalSectionDisplayed = !this.newGoalSectionDisplayed;
  }

  getAllTimeTotals() {
    const currentDate = new Date()
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(currentDate.getMonth() - 1);
    for (const activity of this.allActivities) {
      this.allTimeElevation += activity.elevation
      this.allTimeDistance += activity.distance
      this.allTimeTime += activity.duration
      //Calculate 1 month ago
      if (this.validateDate(activity.date, oneMonthAgo)){
        this.oneMonthAgoElevation += activity.elevation
        this.oneMonthAgoDistance += activity.distance
        this.oneMonthAgoTime += activity.duration
        this.oneMonthAgoActivities += 1
      }
    }
    //Format
    this.allTimeTime = Math.floor(this.allTimeTime / 3600)
    this.allTimeDistance = Math.floor(this.allTimeDistance / 1000)
    this.allTimeElevation = Math.floor(this.allTimeElevation / 1)
    this.allTimeActivities = this.allActivities.length
    //Format 1-mo
    this.oneMonthAgoTime = Math.floor(this.oneMonthAgoTime / 3600)
    this.oneMonthAgoDistance = Math.floor(this.oneMonthAgoDistance / 1000)
    this.oneMonthAgoElevation = Math.floor(this.oneMonthAgoElevation / 1)
  }
  
  validateDate(activityDate: string, boundaryDate: Date): boolean {
    const activityDateFormatted = new Date(activityDate)
    return activityDateFormatted > boundaryDate
  }

  dateComparator(a: Activity, b: Activity): number {
    const aDate = new Date(a.date);
    const bDate = new Date(b.date);
    return bDate.getTime() - aDate.getTime()
  }

}