export default class Goal {
    title: string;
    startDate: string;
    targetDate: string;
    startValue: number;
    targetValue: number;
    metric: string;

    constructor(
        title: string,
        startDate: string,
        targetDate: string,
        startValue: number,
        targetValue: number,
        metric: string
    ) {

        this.title = title;
        this.startDate = startDate;
        this.targetDate = targetDate;
        this.startValue = startValue
        this.targetValue = targetValue;
        this.metric = metric;
    }
}