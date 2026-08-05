export interface AddressData {
    _id: string;
    ownerType: 'customer' | 'vendor' | 'admin';
    owner: string;
    name: string;
    addressLine: string;
    city: string;
    region: string;
    landmark: string;
    phone: string;
    isDefault: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export interface GetAllAddressesResponse {
    success: boolean;
    count: number;
    data: AddressData[];
}

export interface GetDefaultAddressResponse {
    success: boolean;
    data: AddressData | null;
}