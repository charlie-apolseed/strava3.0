import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import Activity from '../../models/activity';
import { ActivitiesService } from '../../activities.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import * as L from 'leaflet';
import { decode } from '@googlemaps/polyline-codec';

@Component({
  selector: 'app-activities-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './activities-list.component.html',
  styleUrl: './activities-list.component.css'
})
export class ActivitiesListComponent implements OnInit {
  activities: Activity[] = [];
  showFilter = false;
  private map: L.Map = L.map('map').setView([51.505, -0.09], 13);



  constructor(private activitiesService: ActivitiesService, @Inject(PLATFORM_ID) private platformId: Object) { }

  ngOnInit(): void {
    this.activitiesService.getMostRecentActivities(10)
      .subscribe(activities => this.activities = activities);
    if (isPlatformBrowser(this.platformId)) {
      this.loadLeaflet().then(() => {
        this.initMap();
      });
    }
  }

  private loadLeaflet(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (typeof window !== 'undefined' && !window['L']) {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => resolve(window['L']);
        script.onerror = (error: any) => reject(error);
        document.head.appendChild(script);
      } else {
        resolve(window['L']);
      }
    });
  }

  private initMap(): void {
    const L = window['L'];
    this.map = L.map('map').setView([51.505, -0.09], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);
  }

  //LOGIC FOR SELECTING ACTIVITY
  expandedActivityIndex: number | null = null;

  toggleActivity(index: number): void {
    if (this.expandedActivityIndex === index) {
      // Collapse if the same item is clicked again
      this.expandedActivityIndex = null;
    } else {
      // Expand the clicked item and collapse others
      this.expandedActivityIndex = index;
    }
    console.log("Toggling activity");
    this.addPolyline();
  }

  private addPolyline(): void {
    // Example encoded polyline string
    if (this.expandedActivityIndex == null) {
      console.log("Expanded Activity Index is null- trying to create a summary plotline.");
      return;
    } 

    const encodedPolyline = this.activities[this.expandedActivityIndex].mapData.summary_polyline;

    // Decode the polyline
    const coordinates = decode(encodedPolyline);

    console.log("Adding polyline.");

    // Create and add the polyline to the map
    L.polyline(coordinates, {
      color: 'red',
      weight: 5,
      opacity: 0.7,
      lineJoin: 'round'
    }).addTo(this.map);
  }
  

  displayFilterInfo(): void {
    this.showFilter = !this.showFilter;
  }



  //LOGIC FOR CONDITIONAL COLORING 
  maxDistance = 150000; // Adjust based on your needs

  getColorForDistance(distance: number): string {

    const normalized = Math.min(Math.sqrt(distance) / Math.sqrt(this.maxDistance), 1);

    // Convert normalized value to a color
    // Here, we're using a simple linear interpolation between blue and red
    const r = 255;
    const g = Math.floor(255 * (1 - normalized));
    const b = 255; // Optional, to ensure more varied colors

    return `rgb(${r}, ${g}, ${b})`;
  }
}
