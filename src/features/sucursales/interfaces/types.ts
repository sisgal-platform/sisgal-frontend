export type Sucursal = {
    id: number;
    name: string;
    city: string;
    phone: string;
    address: string;
    is_active: boolean;
    companyId: number;
    companyName: string;
};

export type SucursalPayload = Omit<Sucursal, "id" | "createdAt">;
