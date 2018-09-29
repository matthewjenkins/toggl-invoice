import * as fs from "fs-extra";
import * as path from "path";
import { IAddress, IClient, IConfig } from "./interfaces";
import chalk from "chalk";

export default class Config implements IConfig {
    private static defaultFile: string = "invoice-config.json";

    public static write(config: IConfig, file?: string, overwrite: boolean = false): void {
        const configFile: string = path.join(process.cwd(), file || Config.defaultFile);

        if (!overwrite && fs.existsSync(configFile)) {
            console.error(chalk.redBright("Config file already exists!"));
            return;
        }

        const data: string = JSON.stringify(config, null, "\t");
        fs.outputFileSync(configFile, data);
    }

    constructor(file?: string) {
        this.read(file);
    }

    public lastInvoice: number;
    public billingAddress: IAddress;
    public token: string;
    public clients: IClient[];

    public getClient(name: string): IClient {
        const project: IClient[] = this.clients.filter(f => f.name === name);
        if (!project.length) {
            console.error(chalk.redBright(`Unable to find project config for ${name}`));
            process.exit(1);
        }

        if (typeof project[0].billingAddress === "undefined" || project[0].billingAddress === null)
            project[0].billingAddress = this.billingAddress;

        return project[0];
    }

    public save(): void {
        const config: IConfig = {
            token: this.token,
            lastInvoice: this.lastInvoice,
            clients: this.clients
        };

        Config.write(config, null, true);
    }

    private read(file?: string): void {
        const filePath: string = path.join(process.cwd(), file || Config.defaultFile);

        try {
            const config: IConfig = fs.readJsonSync(filePath);
            this.token = config.token;
            this.clients = config.clients;
            this.lastInvoice = config.lastInvoice;

            if (typeof this.lastInvoice === "undefined" || this.lastInvoice === null)
                this.lastInvoice = 0;
        } catch (error) {
            // tslint:disable-next-line:max-line-length
            console.error(chalk.redBright("Unable to locate or read config file; Use 'init' command to create a default configuration file."));
            process.exit(1);
        }
    }
}
