import Entry from "../toggl/Entry";
import * as pdf from "pdfkit";
import * as fs from "fs-extra";
import * as path from "path";
import { IAddress, IClient } from "../common/interfaces";
import * as moment from "moment";
import { IGroup, Utils } from "../common/Utils";

export interface IInvoiceWriterOptions {
    client: IClient;
    entries: Entry[];
    start: Date;
    end: Date;
    invoiceNumber: number;
    file: string;
}

export default class InvoiceWriter {
    constructor(public options: IInvoiceWriterOptions) {
    }

    public write(): any {
        const doc: PDFKit.PDFDocument = new pdf();

        fs.ensureDirSync(path.dirname(this.options.file));

        doc.pipe(fs.createWriteStream(this.options.file));

        // fonts
        doc.registerFont("Default", "Helvetica");
        doc.registerFont("Details", "Courier");
        doc.font("Default");

        // header info
        doc.fillColor([71, 103, 155], 80).fontSize(28).text("Invoice", { align: "right" });
        doc.fillColor("black").fontSize(10);
        doc.text(`Date: ${moment().format("LL")}`, { align: "right" });
        doc.text(`Invoice: ${Utils.pad(this.options.invoiceNumber.toString(), 5)}`, { align: "right" });

        doc.moveDown();
        let billingLines: number = 4;
        // billed to
        const billToAddress: IAddress = this.options.client.address;
        doc.text("TO:");
        doc.text(billToAddress.title);
        doc.text(billToAddress.address1);
        doc.text(billToAddress.address2);
        if (typeof billToAddress.email !== "undefined") {
            doc.text(billToAddress.email);
            billingLines++;
        }

        if (typeof billToAddress.phone !== "undefined") {
            doc.text(billToAddress.phone);
            billingLines++;
        }

        const client: IClient = this.options.client;
        // billed from
        const billingAddress: IAddress = client.billingAddress;
        doc.moveUp(billingLines);
        doc.text(billingAddress.title, { align: "right" });
        doc.text(billingAddress.address1, { align: "right" });
        doc.text(billingAddress.address2, { align: "right" });
        if (typeof billingAddress.email !== "undefined")
            doc.text(billingAddress.email, { align: "right" });

        if (typeof billingAddress.phone !== "undefined")
            doc.text(billingAddress.phone, { align: "right" });

        // details
        doc.text("Details", 78, 210);
        doc.font("Details");
        doc.rect(72, doc.y + 5, 467, 5);
        doc.fill([71, 103, 155]);

        doc.moveDown(2);
        doc.lineGap(.5);
        doc.fontSize(8);
        const days: IGroup<string, Entry>[] = Utils.groupBy(this.options.entries, g => g.date);
        for (const day of days) {
            doc.circle(78, doc.y + 2, 2);
            doc.fill([71, 103, 155]);
            doc.fillColor("black");
            const firstItem: Entry = day.values[0];
            const total: number = day.values.map(m => m.duration).reduce((a, b) => a + b, 0);
            // tslint:disable-next-line:max-line-length
            const descriptions: string = Utils.ellipsis(Utils.distinct(day.values.map(m => m.description)).join(", "), 160);

            doc.text(`${firstItem.date} - ${descriptions}`, 83);
            doc.text(`${Utils.pad((total / 60 / 60).toFixed(2), 5)} Hours`, { align: "right" });
            doc.moveDown();
        }

        doc.rect(72, doc.y + 3, 467, 2);
        doc.fill([71, 103, 155]);

        doc.fillColor("black");
        doc.font("Default");
        // tslint:disable-next-line:max-line-length
        const totalHours: string = (this.options.entries.map(m => m.duration).reduce((a, b) => a + b, 0) / 60 / 60).toFixed(2);
        const totalBillAmount: string = (Number(totalHours) * client.rate).toFixed(2);

        // totals
        doc.moveDown(2);
        doc.fontSize(10);
        doc.text(`Total Hours: ${totalHours}`, { align: "right" });
        doc.text(`Hourly Rate: $${client.rate}`, { align: "right" });
        doc.rect(458, doc.y + 1, 81, 1);
        doc.fill([71, 103, 155]);
        doc.moveDown();
        doc.fillColor("black");
        doc.text(`Total: $${totalBillAmount}`, { align: "right" });

        if (typeof client.notice !== "undefined")
            doc.fontSize(8).text(client.notice, 78, 700);

        doc.end();
    }
}
