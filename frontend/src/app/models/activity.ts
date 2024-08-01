export default class Activity {
    title: string;
    date: string;
    duration: number;
    distance: number;
    avgHeartRate: number;
    maxHeartRate: number;
    mapData: object; 
  
    constructor(
      title: string,
      date: string,
      duration: number,
      distance: number,
      avgHeartRate: number,
      maxHeartRate: number,
      mapData: object
    ) {
      this.title = title;
      this.date = date;
      this.duration = duration;
      this.distance = distance;
      this.avgHeartRate = avgHeartRate;
      this.maxHeartRate = maxHeartRate;
      this.mapData = mapData;
    }
  }