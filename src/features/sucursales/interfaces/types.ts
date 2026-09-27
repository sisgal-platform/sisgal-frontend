export type Sucursal = {
    id: number;
    name: string;
    address: string;
    phone: string;
    city: string;
    is_active: boolean;
    companyId: number;
    createdAt?: string;
};

export type SucursalCreatePayload = {
    nombre: string;
    direccion: string;
    telefono: string;
    ciudad: string;
    companyId: number;
};

export type SucursalUpdatePayload = Partial<SucursalCreatePayload>;
