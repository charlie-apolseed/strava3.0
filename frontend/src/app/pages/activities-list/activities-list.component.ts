import { Component, OnInit, Inject, PLATFORM_ID, Renderer2, ElementRef, ViewChild, ViewEncapsulation } from '@angular/core';
import Activity from '../../models/activity';
import { ActivitiesService } from '../../services/activities.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { decode } from '@googlemaps/polyline-codec';
import { DurationPipe } from '../../pipes/duration.pipe';
import { LabelType, NgxSliderModule, Options } from '@angular-slider/ngx-slider';
import { HttpErrorResponse } from '@angular/common/http';


@Component({
  selector: 'app-activities-list',
  standalone: true,
  imports: [CommonModule, DurationPipe, NgxSliderModule, FormsModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './activities-list.component.html',
  styleUrls: ['./activities-list.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class ActivitiesListComponent implements OnInit {
  @ViewChild('titleElement') titleContent!: ElementRef;
  @ViewChild('noteContent') noteContent!: ElementRef;
  @ViewChild('closeBtn') closeBtn!: ElementRef;
  isBrowser: boolean;
  displayedActivities: Activity[] = [];
  filteredActivities: Activity[] = [];
  activities: Activity[] = [];
  private map!: L.Map;
  private polylines: L.Polyline[] = [];
  private markers: L.Marker[] = [];
  expandedActivityIndex: number | null = null;
  expandedActivity: Activity | null = null;
  editingNote: boolean = false;
  editableNotes: string = '';
  totalActivities = 0;
  currentPage = 1;
  activitiesPerPage = 9;
  isSingleLine: boolean = true;
  sortCriteria = "date";
  sortReversed = false;

  minHrFilter = 125;
  maxHrFilter = 145;
  minDistanceFilter = 50;
  maxDistanceFilter = 150;
  minElevationFilter = 100;
  maxElevationFilter = 1000;

  //Temporary Holders
  tempDistanceChecked: boolean = true;
  tempElevationChecked: boolean = true;
  tempHrChecked: boolean = true;
  tempFavoritesChecked: boolean = false;
  tempClimbChecked: boolean = false;
  tempScenicChecked: boolean = false;
  tempChallengingChecked: boolean = false;
  tempWorkoutChecked: boolean = false;

  distanceChecked: boolean = true;
  elevationChecked: boolean = true;
  hrChecked: boolean = true;
  favoritesChecked: boolean = false;
  climbChecked: boolean = false;
  scenicChecked: boolean = false;
  challengingChecked: boolean = false;
  workoutChecked: boolean = false;




  ///////////////// SLIDER and FILTER 
  displayFilter(): void {
    if (this.maxDistanceFilter > 400) {
      this.maxDistanceValue = 400;
    } else {
      this.maxDistanceValue = this.maxDistanceFilter
    }
    this.minDistanceValue = this.minDistanceFilter
    if (this.maxElevationFilter > 4000) {
      this.maxElevationValue = 4000;
    } else {
      this.maxElevationValue = this.maxElevationFilter
    }
    this.minElevationValue = this.minElevationFilter
  }

  /* Method called to apply the filter when save changes is clicked on the filter modal*/
  applyFilter(): void {
    this.distanceChecked = this.tempDistanceChecked;
    this.elevationChecked = this.tempElevationChecked;
    this.hrChecked = this.tempHrChecked;
    this.favoritesChecked = this.tempFavoritesChecked;
    this.climbChecked = this.tempClimbChecked;
    this.scenicChecked = this.tempScenicChecked;
    this.challengingChecked = this.tempChallengingChecked;
    this.workoutChecked = this.tempWorkoutChecked;


    if (this.distanceChecked) {
      this.maxDistanceFilter = this.maxDistanceValue === 400 ? 9999 : this.maxDistanceValue;
      this.minDistanceFilter = this.minDistanceValue;
    }
    if (this.elevationChecked) {
      this.maxElevationFilter = this.maxElevationValue === 4000 ? 9999 : this.maxElevationValue;
      this.minElevationFilter = this.minElevationValue;
    }
    if (this.hrChecked) {
      this.maxHrFilter = this.maxHrValue === 165 ? 9999 : this.maxHrValue;
      this.minHrFilter = this.minHrValue;
    }
    const startTime = this.getStartTimeBasedOnSelection();
    this.filteredActivities = [];

    // Loop through each activity and apply all filters
    for (let idx = 0; idx < this.activities.length; idx++) {
      const activity = this.activities[idx];

      // Time filter - Ensure the activity is within the specified time range
      const activityDate = new Date(activity.date); // Assuming 'date' is a string in ISO format or similar
      if (activityDate < startTime) {
        continue; // Skip activities outside the time range
      }
      if (this.distanceChecked) {
        if (!(this.maxDistanceFilter >= activity.distance / 1000 && this.minDistanceFilter <= activity.distance / 1000)) {
          continue;
        }
      }
      if (this.elevationChecked) {
        if (!(this.maxElevationFilter >= activity.elevation && this.minElevationFilter <= activity.elevation)) {
          continue;
        }
      }
      if (this.hrChecked) {
        if (!(this.maxHrFilter >= activity.avgHeartRate && this.minHrFilter <= activity.avgHeartRate)) {
          continue;
        }
      }
      if (this.favoritesChecked && !activity.tags.includes("favorite")) {
        continue;
      }
      if (this.climbChecked && !activity.tags.includes("climb")) {
        continue;
      }
      if (this.scenicChecked && !activity.tags.includes("scenic")) {
        continue;
      }
      if (this.challengingChecked && !activity.tags.includes("challenging")) {
        continue;
      }
      if (this.workoutChecked && !activity.tags.includes("workout")) {
        continue;
      }


      this.filteredActivities.push(activity);

    }


    // Update displayed activities
    this.filteredActivities;
    this.sortBy(this.sortCriteria);
    console.log("Filter resulted in " + this.filteredActivities.length + " activities");



    // Close the modal
    this.closeBtn.nativeElement.click();
  }


  //Distance slider
  minDistanceValue: number = 50;
  maxDistanceValue: number = 150;
  distanceOptions: Options = {
    floor: 0,
    ceil: 400,
    step: 1, // Optional: step size for the slider
    noSwitching: true, // Optional: prevent minValue and maxValue from swapping
    translate: (value: number, label: LabelType): string => {
      switch (label) {
        case LabelType.Low:
          if (this.minDistanceValue < 37) {
            return value + " km"
          } else {
            return "" + value;
          }
        case LabelType.High:
          if (this.maxDistanceValue == 400) {
            return value + "+ km";
          } else if (this.maxDistanceValue > 340) {
            return value + " km"
          } else {
            return value + ""
          }
        case LabelType.Ceil:
          return value + " km";
        default:
          return value + " km";
      }
    }
  };
  //Elevation Slider
  minElevationValue: number = 100;
  maxElevationValue: number = 1000;
  elevationOptions: Options = {
    floor: 0,
    ceil: 4000,
    step: 1, // Optional: step size for the slider
    noSwitching: true, // Optional: prevent minValue and maxValue from swapping
    translate: (value: number, label: LabelType): string => {
      switch (label) {
        case LabelType.Low:
          if (this.minElevationValue < 360) {
            return value + " m"
          } else {
            return "" + value;
          }
        case LabelType.High:
          if (this.maxElevationValue == 4000) {
            return value + "+ m";
          } else if (this.maxElevationValue > 3340) {
            return value + " m"
          }
          return "" + value;
        case LabelType.Ceil:
          return value + " m";
        default:
          return value + " m";
      }
    }
  };
  //Hr Slider
  minHrValue: number = 125;
  maxHrValue: number = 145;
  hrOptions: Options = {
    floor: 90,
    ceil: 165,
    step: 1, // Optional: step size for the slider
    noSwitching: true, // Optional: prevent minValue and maxValue from swapping
    translate: (value: number, label: LabelType): string => {
      switch (label) {
        case LabelType.Low:
          if (this.minHrValue < 104) {
            return value + " bpm";
          } else {
            return "" + value;
          }
        case LabelType.High:
          if (this.maxHrValue == 190) {
            return value + "+ bpm";
          } else if (this.maxHrValue > 3340) {
            return value + " bpm";
          }
          return "" + value;
        case LabelType.Ceil:
          return value + " bpm";
        default:
          return value + " bpm";
      }
    }
  };

  /* Function to calculate the start time based on selected radio option */
  getStartTimeBasedOnSelection(): Date {
    // Get the selected radio button
    const selectedRadio = document.querySelector('input[name="flexRadioDefault"]:checked') as HTMLInputElement;

    // Get the current date
    const endTime = new Date();
    let startTime: Date;

    // Calculate the start time based on the selected value
    switch (selectedRadio.value) {
      case "1year":
        startTime = new Date(endTime.getFullYear() - 1, endTime.getMonth(), endTime.getDate());
        break;
      case "6months":
        startTime = new Date(endTime.getFullYear(), endTime.getMonth() - 6, endTime.getDate());
        break;
      case "1month":
        startTime = new Date(endTime.getFullYear(), endTime.getMonth() - 1, endTime.getDate());
        break;
      case "1week":
        startTime = new Date(endTime.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
        break;
      case "allTime":
      default:
        startTime = new Date(0); // Set to the earliest possible date if "All time" is selected
        break;
    }

    return startTime;
  }

  /////////////////

  constructor(private activitiesService: ActivitiesService, @Inject(PLATFORM_ID) private platformId: Object, private renderer: Renderer2) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }


  async ngOnInit(): Promise<void> {
    this.activitiesService.uploadActivitiesToDatabase().subscribe({
      next: (response) => {
        console.log('Update successful', response);
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

    this.activitiesService.getAllActivities().subscribe(activities => {
      this.activities = activities;
      this.filteredActivities = activities;
      this.sortBy('date');
    });


    if (isPlatformBrowser(this.platformId)) {
      this.loadLeaflet().then(() => {
        this.initMap();
      });
    }
  }

  /** TOGGLE ACTIVITY LOGIC*/
  toggleActivity(index: number): void {
    if (this.expandedActivityIndex === index) {
      this.collapseActivity();
    } else {
      this.expandActivity(index);
    }
  }

  private collapseActivity(): void {
    this.expandedActivityIndex = null;
    this.expandedActivity = null;
    this.editableNotes = "";
    const noteContent = document.getElementById("noteContent");
    if (noteContent != null) {
      this.cancelEditing(noteContent);
    }
    this.clearPolylines();
    this.clearMarkers();
  }

  private expandActivity(index: number): void {
    this.expandedActivityIndex = index;
    this.expandedActivity = this.displayedActivities[this.expandedActivityIndex];
    if (this.expandedActivity.notes !== "") {
      this.editableNotes = this.expandedActivity.notes;
    } else {
      this.editableNotes = "Add your activity notes here";
    }
    const noteContent = document.getElementById("notesContent");
    if (noteContent != null) {
      this.cancelEditing(noteContent);
    }
    setTimeout(() => {
      const titleElement = this.titleContent.nativeElement;
      this.isSingleLine = titleElement.clientHeight <= 40;
      console.log("Is single line:", this.isSingleLine);
    });
    this.clearPolylines();
    this.clearMarkers();
    this.addPolyline(index);
    // Check if the title fits in a single line

  }


  /** END OF TOGGLE ACTIVITY LOGIC */


  /** MAP LOGIC */
  private loadLeaflet(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (isPlatformBrowser(this.platformId)) {
        import('leaflet').then(L => {
          window['L'] = L;
          resolve(L);
        }).catch(error => reject(error));
      } else {
        resolve(null);
      }
    });
  }


  private initMap(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const L = window['L'];
    this.map = L.map('map').setView([51.505, -0.09], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);
  }


  private clearPolylines(): void {
    this.polylines.forEach(polyline => this.map.removeLayer(polyline));
    this.polylines = [];
  }

  private clearMarkers(): void {
    this.markers.forEach(marker => this.map.removeLayer(marker));
    this.markers = [];
  }

  private addPolyline(index: number): void {
    if (!isPlatformBrowser(this.platformId) || !this.map) return;

    const activity = this.displayedActivities[index];
    const encodedPolyline = activity.mapData.summary_polyline;

    if (!encodedPolyline) return;

    const coordinates = decode(encodedPolyline).map(coord => [coord[0], coord[1]] as [number, number]);
    const startCoordinate = coordinates[0];
    const endCoordinate = coordinates[coordinates.length - 1];

    const L = window['L'];

    const polyline = L.polyline(coordinates, {
      color: 'rgb(255, 0, 255)',
      weight: 5,
      opacity: 0.7,
      lineJoin: 'round'
    }).addTo(this.map);

    this.polylines.push(polyline);

    const startMarker = L.marker(startCoordinate, {
      icon: L.icon({
        iconUrl: 'icons/start-icon.png',
        iconSize: [32, 32],
        iconAnchor: [16, 32]
      })
    }).addTo(this.map);

    const endMarker = L.marker(endCoordinate, {
      icon: L.icon({
        iconUrl: 'icons/finish-icon.png',
        iconSize: [32, 32],
        iconAnchor: [16, 32]
      })
    }).addTo(this.map);

    this.markers.push(startMarker, endMarker);

    const bounds = polyline.getBounds();
    const padding = 0.2; // 20% padding
    this.map.fitBounds(bounds, {
      padding: [this.map.getSize().x * padding, this.map.getSize().y * padding]
    });
  }
  /**END OF MAP LOGIC */

  /**Footer section */
  displayPage(page: number): void {
    this.currentPage = page;
    const startIndex = (page - 1) * this.activitiesPerPage;
    const endIndex = startIndex + this.activitiesPerPage;
    this.displayedActivities = this.filteredActivities.slice(startIndex, endIndex);
  }

  nextPage(): void {
    if ((this.currentPage * this.activitiesPerPage) < this.filteredActivities.length) {
      this.displayPage(this.currentPage + 1);
      this.resetHighlightColor();
    }
  }

  previousPage(): void {
    if (this.currentPage !== 1) {
      this.displayPage(this.currentPage - 1);
      this.resetHighlightColor();
    }
  }

  getEndIndex(): number {
    return Math.min(this.currentPage * this.activitiesPerPage, this.filteredActivities.length);
  }

  private resetHighlightColor(): void {
    this.expandedActivityIndex = null;
  }
  /**End of Footer Section */





  ////////////////////////////////////
  /*Logic for editing and saving note*/
  startEditing(noteContent: HTMLElement): void {
    if (this.expandedActivity !== null) {
      this.editingNote = true;
      this.editableNotes = this.expandedActivity.notes;
      this.renderer.setAttribute(noteContent, 'contenteditable', 'true');
      this.renderer.setStyle(noteContent, 'background', 'var(--list-color)');
      noteContent.focus();
    }
  }

  cancelEditing(noteContent: HTMLElement): void {
    this.editingNote = false;
    if (this.expandedActivity !== null) {
      this.editableNotes = this.expandedActivity.notes || 'Add your activity notes here';
    }
    this.renderer.removeAttribute(noteContent, 'contenteditable');
    this.renderer.setStyle(noteContent, 'background', 'transparent');
  }

  saveEditing(noteContent: HTMLElement): void {
    const updatedNotes = noteContent.innerHTML;
    if (this.expandedActivity !== null) {
      this.editableNotes = updatedNotes;
      this.activitiesService.updateActivityNotes(this.expandedActivity.title, this.expandedActivity.date, updatedNotes)
        .subscribe(updatedActivity => {
          if (this.expandedActivity !== null) {
            this.expandedActivity.notes = updatedNotes;
            this.editingNote = false;
            this.renderer.removeAttribute(noteContent, 'contenteditable');
            this.renderer.setStyle(noteContent, 'background', 'transparent');
          }
        }, error => {
          console.error('Error updating notes', error);
        });
    }
  }

  ///Favoriting an avtivity
  toggleTag(tag: string): void {
    if (this.expandedActivity != null) {
      // Check if the "favorite" tag is present in the tags array
      if (tag == 'favorite') {
        const isFavorite = this.expandedActivity.tags.includes('favorite');

        // Toggle the "favorite" tag
        if (isFavorite) {
          // Remove the "favorite" tag
          this.expandedActivity.tags = this.expandedActivity.tags.filter(tag => tag !== 'favorite');
        } else {
          // Add the "favorite" tag
          this.expandedActivity.tags.push('favorite');
        }
      }

      if (tag == 'climb') {
        const isFavorite = this.expandedActivity.tags.includes('climb');

        // Toggle the "favorite" tag
        if (isFavorite) {
          // Remove the "favorite" tag
          this.expandedActivity.tags = this.expandedActivity.tags.filter(tag => tag !== 'climb');
        } else {
          // Add the "favorite" tag
          this.expandedActivity.tags.push('climb');
        }
      }


      if (tag == 'workout') {
        const isWorkout = this.expandedActivity.tags.includes('workout');

        // Toggle the "favorite" tag
        if (isWorkout) {
          // Remove the "favorite" tag
          this.expandedActivity.tags = this.expandedActivity.tags.filter(tag => tag !== 'workout');
        } else {
          // Add the "favorite" tag
          this.expandedActivity.tags.push('workout');
        }
      }


      if (tag == 'scenic') {
        const isScenic = this.expandedActivity.tags.includes('scenic');

        // Toggle the "favorite" tag
        if (isScenic) {
          // Remove the "favorite" tag
          this.expandedActivity.tags = this.expandedActivity.tags.filter(tag => tag !== 'scenic');
        } else {
          // Add the "favorite" tag
          this.expandedActivity.tags.push('scenic');
        }
      }


      if (tag == 'challenging') {
        const isChallenging = this.expandedActivity.tags.includes('challenging');

        // Toggle the "favorite" tag
        if (isChallenging) {
          // Remove the "favorite" tag
          this.expandedActivity.tags = this.expandedActivity.tags.filter(tag => tag !== 'challenging');
        } else {
          // Add the "favorite" tag
          this.expandedActivity.tags.push('challenging');
        }
      }

      // Call the service to update the favorite status
      this.activitiesService.updateActivityTags(
        this.expandedActivity.title,
        this.expandedActivity.date,
        this.expandedActivity.tags // Pass the updated tags
      ).subscribe(updatedActivity => {
        if (this.expandedActivity !== null) {
          console.log("tags updated");
        }
      }, error => {
        console.error('Error updating notes', error);
      });
    }
  }

  sortBy(criteria: string): void {
    this.sortCriteria = criteria;
    switch (this.sortCriteria) {
      case 'distance':
        this.filteredActivities.sort((a, b) => b.distance - a.distance);
        break;
      case 'elevation':
        this.filteredActivities.sort((a, b) => b.elevation - a.elevation);
        break;
      case 'date':
        this.filteredActivities.sort(this.dateComparator);
        break;
      default:
        this.filteredActivities.sort(this.dateComparator);
        break;
    }
    if (this.sortReversed) {
      this.filteredActivities.reverse()
    }
    this.displayPage(1);
  }


  dateComparator(a: Activity, b: Activity): number {
    const aDate = new Date(a.date);
    const bDate = new Date(b.date);
    return bDate.getTime() - aDate.getTime()
  }

  toggleSortOrder(): void {
    this.sortReversed = !this.sortReversed;
    this.sortBy(this.sortCriteria);
  }




  ////////////////////////////////////
  /*Logic for conditional distance coloring*/
  maxDistance = 150000;

  getColorForDistance(distance: number): string {
    const normalized = Math.min(Math.sqrt(distance) / Math.sqrt(this.maxDistance), 1);
    const r = 255;
    const g = Math.floor(255 * (1 - normalized));
    const b = 255;

    if (distance <= 10) {
      return 'rgb(255, 245, 255)';
    }

    return `rgb(${r}, ${g}, ${b})`;
  }
}
