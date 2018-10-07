import chalk from "chalk";
import * as moment from "moment";
import Config from "../common/config";
import { TogglApi } from "../toggl/togglApi";
import { IClient } from "../common/interfaces";
import { IProject, IWorkspace } from "../toggl/interfaces";
import Entry from "../toggl/Entry";

export default class CreateInvoice {
    public async invoke(options: ICheckInvoiceOptions): Promise<any> {
        console.log(chalk.green("Checking Project Time Period"));
        console.log(chalk.cyan(`Client: ${options.client}`));
        console.log(chalk.cyan(`Period Start: ${moment(options.start, "MM-DD-YYYY").format("ll")}`));
        console.log(chalk.cyan(`Period End: ${moment(options.end, "MM-DD-YYYY").format("ll")}`));

        const config: Config = new Config();
        const api: TogglApi = new TogglApi(config.token);
        const client: IClient = config.getClient(options.client);

        if (typeof client === "undefined") {
            console.error(chalk.red(`No client configuration exists for ${options.client}`));
            process.exit(1);
        }

        if (typeof client.projectId === "undefined" || client.projectId === null) {
            const workspaces: IWorkspace[] = await api.getWorkspaces();
            for (const workspace of workspaces) {
                const projects: IProject[] = await api.getProjects(workspace.id);
                const project: IProject[] = projects.filter(f => f.name === options.client);
                if (project.length) {
                    client.projectId = project[0].id;
                    config.save();
                    break;
                }
            }
        }

        if (typeof client.projectId === "undefined") {
            console.error(chalk.red(`Unable to locate a project id for ${options.client}`));
            process.exit(0);
        }

        const entries: Entry[] = await api.getEntries(options.start, options.end, client.projectId);
        const totalHours: string = (entries.map(m => m.duration).reduce((a, b) => a + b, 0) / 60 / 60).toFixed(2);
        const totalBillAmount: string = (Number(totalHours) * client.rate).toFixed(2);

        console.log(chalk.cyan(`Entries: ${entries.length}`));
        console.log(chalk.cyan(`Billed Hours: ${totalHours}`));
        console.log(chalk.cyan(`Billed Ammount: $${totalBillAmount}`));
    }
}

interface ICheckInvoiceOptions {
    client: string;
    start: Date;
    end: Date;
}
