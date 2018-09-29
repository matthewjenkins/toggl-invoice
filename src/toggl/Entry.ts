import * as moment from "moment";

export default class Entry {
    public id: number;
    public duration: number;
    public pid: number;
    public description: string;
    public start: Date;
    public stop: Date;
    public tags: string[];
    public get date(): string {
        return moment(this.start).format("MM/DD/YYYY");
    }
}
