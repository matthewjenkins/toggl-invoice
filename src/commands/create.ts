import { TogglApi } from "../toggl/togglApi";
import Config from "../common/config";
import chalk from "chalk";
import * as moment from "moment";
import InvoiceWriter from "../invoice/writer";
import { IClient } from "../common/interfaces";
import Entry from "../toggl/Entry";
import { IProject, IWorkspace } from "../toggl/interfaces";
import * as path from "path";

interface ICreateInvoiceOptions {
    client: string;
    start: Date;
    end: Date;
}

export default class CreateInvoice {
    public async invoke(options: ICreateInvoiceOptions): Promise<any> {
        console.log(chalk.cyan("Creating Invoice"));
        console.log(chalk.cyan(`Client: ${options.client}`));
        console.log(chalk.cyan(`Period Start: ${moment(options.start, "MM-DD-YYYY").toString()}`));
        console.log(chalk.cyan(`Period End: ${moment(options.end, "MM-DD-YYYY").toString()}`));

        const config: Config = new Config();
        const api: TogglApi = new TogglApi(config.token);
        const client: IClient = config.getClient(options.client);

        if (typeof client === "undefined") {
            console.error(chalk.red(`No client configuration exists for ${options.client}`));
            process.exit(2);
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
            process.exit(2);
        }

        console.log(chalk.cyan(`Project Id: ${client.projectId}`));

        const entries: Entry[] = await api.getEntries(options.start, options.end, client.projectId);

        if (!entries.length) {
            console.error(chalk.redBright("No Entries found for that time period."));
            process.exit(1);
        }

        console.log(chalk.cyan(`Entries: ${entries.length}`));

        config.lastInvoice++;
        // filename setup
        const start: moment.Moment = moment(options.start, "MM-DD-YYYY");
        const end: moment.Moment = moment(options.end, "MM-DD-YYYY");
        // tslint:disable-next-line:max-line-length
        const fileName: string = `${client.name}_${config.lastInvoice}_${start.format("YYYY")}_${start.format("MMDD")}_${end.format("MMDD")}.pdf`;
        const filePath: string = path.join(process.cwd(), "invoices", fileName);

        const writer: InvoiceWriter = new InvoiceWriter({
            client, entries,
            start,
            end,
            invoiceNumber: config.lastInvoice,
            file: filePath
        });

        writer.write();
        config.save(); // save burnt invoice number;
    }
}
