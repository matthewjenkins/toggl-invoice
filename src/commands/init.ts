import chalk from "chalk";
import Config from "../common/config";
import { IConfig } from "../common/interfaces";

export default class InitCommand {
    public invoke(options: InitOptions): void {
        console.log(chalk.cyan("Creating Configuration File"));
        const config: IConfig = {
            token: "",
            lastInvoice: 0,
            clients: [
                {
                    name: "Default Project",
                    rate: 0,
                    projectId: null,
                    address: {
                        address1: "",
                        address2: "",
                        title: "",
                        email: "",
                        fax: "",
                        phone: ""
                    }
                }
            ]
        };

        Config.write(config);
        console.log(chalk.cyan("Configuration file saved."));
    }
}

export interface InitOptions {
    name: string;
}
