import { Component, OnInit } from '@angular/core';
import Activity from '../../models/activity';
import { ActivitiesService } from '../../activities.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-activities-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './activities-list.component.html',
  styleUrl: './activities-list.component.css'
})
export class ActivitiesListComponent implements OnInit{
  activities: Activity[] = [];


  constructor(private activitiesService: ActivitiesService) {}

  ngOnInit(): void {
      this.activitiesService.getMostRecentActivities(10)
        .subscribe(activities => this.activities = activities);
  }
}
