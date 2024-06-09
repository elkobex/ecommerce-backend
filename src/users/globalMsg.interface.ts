export interface GlobalMessage{
    fullName: string
    email: string;
    phone: string;
    password: string;
    address: string;

    country: {name: string; code: string;};
    state: {name: string; code: string;};

    city: string;
    zipCode: string;

    cardNumber: string;
    expirationDate: string;
    cardCVV: string;
    added: boolean;
    deleted: boolean;
    declined: boolean;
    entryDate: string;
}