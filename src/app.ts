import * as program from "commander";
import CreateInvoice from "./commands/create";
import pkg = require("../package.json");
import InitCommand from "./commands/init";
import chalk from "chalk";

program
    .command("create [client] [start] [end]")
    .description("Create an invoice")
    .option("-c, --client", "The client to use from the config file.")
    .option("-s, --start", "Billing period start (M-D-YYYY.)")
    .option("-e, --end", "Billing period end (M-D-YYYY.)")
    .action((client, start, end) => {
        if (client === undefined || start === undefined || end === undefined) {
            program.outputHelp(chalk.red);
            process.exit(1);
        }

        const action: CreateInvoice = new CreateInvoice();
        action.invoke({ client, start, end });
    });

program
    .command("init [project]")
    .description("Create a default configuration file")
    .action(options => {
        const action: InitCommand = new InitCommand();
        action.invoke(options);
    });

program.version((pkg as any).version);

program.parse(process.argv);
