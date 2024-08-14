import { expand } from "rxjs";

// Import or define the MapData interface
interface MapData {
  id: string;
  summary_polyline: string;
}

export default class Activity {
  title: string;
  date: string;
  duration: number;
  restTime: number;
  avgSpeed: number;
  maxSpeed: number;
  distance: number;
  elevation: number;
  avgHeartRate: number;
  maxHeartRate: number;
  mapData: MapData;
  notes: string;
  tags: string[];
  images: string[];


  constructor(
    title: string,
    date: string,
    duration: number,
    restTime: number,
    avgSpeed: number,
    maxSpeed: number,
    distance: number,
    elevation: number,
    avgHeartRate: number,
    maxHeartRate: number,
    mapData: MapData,
    notes: string,
    tags: string[],
    images: string[]
  ) {
    this.avgSpeed = avgSpeed;
    this.maxSpeed = maxSpeed;
    this.title = title;
    this.date = date;
    this.duration = duration;
    this.restTime = restTime;
    this.distance = distance;
    this.elevation = elevation;
    this.avgHeartRate = avgHeartRate;
    this.maxHeartRate = maxHeartRate;
    this.mapData = mapData;
    this.notes = notes;
    this.tags = tags;
    this.images = images;
  }
}