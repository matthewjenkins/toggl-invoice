import axios from "axios";
import { IProject, IWorkspace } from "./interfaces";
import * as chalk from "chalk";
import * as moment from "moment";
import Entry from "./Entry";

export class TogglApi {
    private static readonly url: string = "https://www.toggl.com/api/v8";

    constructor(token: string) {
        this._token = token;
    }

    private readonly _token: string;

    public async getProjects(workspaceId: number): Promise<IProject[]> {
        return await this.get<IProject[]>(`/workspaces/${workspaceId}/projects`);
    }

    public async getWorkspaces(): Promise<IWorkspace[]> {
        return await this.get<IWorkspace[]>("/workspaces");
    }

    public async getEntries(start: Date, end: Date, projectId: number): Promise<Entry[]> {
        const data: Entry[] = await this.get<Entry[]>("/time_entries", {
            start_date: moment(start, "MM-DD-YYYY").toISOString(),
            end_date: moment(end, "MM-DD-YYYY").toISOString()
        });

        return data.filter(item => item.duration > 0 && item.pid === projectId).map(m => {
            const item: Entry = new Entry();
            item.pid = m.pid;
            item.start = m.start;
            item.stop = m.stop;
            item.tags = m.tags;
            item.duration = m.duration;
            item.description = m.description;
            item.id = m.id;
            return item;
        });
    }

    private async get<T>(endpoint: string, params?: any): Promise<T> {
        const data: any = await axios.get(`${TogglApi.url}${endpoint}`, {
            auth: {
                username: this._token,
                password: "api_token"
            },
            params
        });

        return data.data;
    }
}
