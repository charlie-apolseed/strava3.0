import { Component, OnInit, Inject, PLATFORM_ID, Renderer2, ElementRef, ViewChild } from '@angular/core';
import Activity from '../../models/activity';
import { ActivitiesService } from '../../activities.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { decode } from '@googlemaps/polyline-codec';
import { DurationPipe } from '../../pipes/duration.pipe';

@Component({
  selector: 'app-activities-list',
  standalone: true,
  imports: [CommonModule, DurationPipe],
  templateUrl: './activities-list.component.html',
  styleUrls: ['./activities-list.component.css']
})
export class ActivitiesListComponent implements OnInit {
  @ViewChild('noteContent') noteContent!: ElementRef;

  activities: Activity[] = [];
  showFilter = false;
  private map!: L.Map;
  private polylines: L.Polyline[] = [];
  private markers: L.Marker[] = [];
  expandedActivityIndex: number | null = null;
  expandedActivity: Activity | null = null;
  editingNote: boolean = false;
  editableNotes: string = '';

  constructor(private activitiesService: ActivitiesService, @Inject(PLATFORM_ID) private platformId: Object, private renderer: Renderer2) { }

  ngOnInit(): void {
    this.activitiesService.getMostRecentActivities(10).subscribe(activities => this.activities = activities);

    if (isPlatformBrowser(this.platformId)) {
      this.loadLeaflet().then(() => {
        this.initMap();
      });
    }
  }

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

  toggleActivity(index: number): void {
    if (this.expandedActivityIndex === index) {
      this.resetActivityState();
    } else {
      if (this.editingNote && this.noteContent) {
        this.cancelEditing(this.noteContent.nativeElement);
      }
      this.expandedActivityIndex = index;
      this.expandedActivity = this.activities[this.expandedActivityIndex];
      this.editableNotes = this.expandedActivity.notes || 'Add your activity notes here';
      this.clearPolylines();
      this.clearMarkers();
      this.addPolyline(index);
    }
  }

  private resetActivityState(): void {
    this.expandedActivityIndex = null;
    this.expandedActivity = null;
    this.editableNotes = '';
    if (this.noteContent) {
      this.cancelEditing(this.noteContent.nativeElement);
    }
    this.clearPolylines();
    this.clearMarkers();
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

    const activity = this.activities[index];
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

    this.map.fitBounds(polyline.getBounds());
  }

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

  

  ////////////////////////////////////
  /*Logic for displaying filter info*/
  displayFilterInfo(): void {
    this.showFilter = !this.showFilter;
  }

  ////////////////////////////////////
  /*Logic for conditional distance coloring*/
  maxDistance = 150000;

  getColorForDistance(distance: number): string {
    const normalized = Math.min(Math.sqrt(distance) / Math.sqrt(this.maxDistance), 1);
    const r = 255;
    const g = Math.floor(255 * (1 - normalized));
    const b = 255;

    return `rgb(${r}, ${g}, ${b})`;
  }
}
