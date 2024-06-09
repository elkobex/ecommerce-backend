export interface IAddress{
    fullName: string;
    phoneNumber: string;
    country: {code: string; name: string};
    state: {code: string; name: string};
    city: string;
    zipCode: string;
    address: string;
}