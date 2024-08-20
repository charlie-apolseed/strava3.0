export default class Goal {
    title: string;
    startDate: string;
    targetDate: string;
    startValue: number;
    targetValue: number;
    metric: string;
    completed: boolean;

    constructor(
        title: string,
        startDate: string,
        targetDate: string,
        startValue: number,
        targetValue: number,
        metric: string,
        completed: boolean
    ) {

        this.title = title;
        this.startDate = startDate;
        this.targetDate = targetDate;
        this.startValue = startValue
        this.targetValue = targetValue;
        this.metric = metric;
        this.completed = completed;
    }
}