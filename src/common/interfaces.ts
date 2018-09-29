export interface IAddress {
    title: string;
    address1: string;
    address2: string;
    email?: string;
    phone?: string;
    fax?: string;
}

export interface IConfig {
    token: string;
    lastInvoice: number;
    clients: IClient[];
}

export interface IClient {
    name: string;
    rate: number;
    projectId?: number;
    address: IAddress;
    billingAddress?: IAddress;
    notice?: string;
}
