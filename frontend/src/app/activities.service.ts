import { Injectable } from '@angular/core';
import { WebService } from './web.service';
import { title } from 'process';
import { Observable } from 'rxjs';
import Activity from './models/activity';

@Injectable({
  providedIn: 'root'
})
export class ActivitiesService {

  constructor(private webService: WebService) { }

  getAllActivities() {
    return this.webService.get('rides') as Observable<Activity[]>;
  }

  /** Gets the specified number of rides */
  getMostRecentActivities(num: Number) {
    return this.webService.get(`rides/${num}`) as Observable<Activity[]>;
  }

  /** Used for uploading recent activities not currently in database */
  uploadActivitiesToDatabase() {
    console.log("activities-service: updating");
    return this.webService.post('rides/update', {});
  }

  /**Used for reseting database to match all activities in strava */
  reuploadAllActivitiesToDatabase() {
    return this.webService.post('rides', {})
  }

  /**Delete a specified activity */
  deleteActivity(title: string, date: string) {
    return this.webService.delete(`rides/${title}/${date}`);
  }

  updateActivityNotes(title: string, date: string, notes: string) {
    return this.webService.patch(`rides/notes/${title}/${date}`, { notes });
  }

  updateActivityTags(title: string, date: string, tags: string[]) {
    return this.webService.patch(`rides/tags/${title}/${date}`, { tags });
  }
}
