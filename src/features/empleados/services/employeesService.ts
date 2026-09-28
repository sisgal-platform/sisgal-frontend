import apiClient from "@/lib/axios";
import type { Employee, EmployeeListFilters, RegisterEmployeePayload, UpdateEmployeePayload } from "../interfaces/types";


export const employeesService = {
    async create(payload: RegisterEmployeePayload): Promise<Employee> {
        const {data} = await apiClient.post<Employee>('/empleados', payload)

        return data
    },

    async list(filters: EmployeeListFilters = {}): Promise<Employee[]> {
        const {data} = await apiClient.get<Employee[]>('/empleados', { params: filters })

        return data
    },

    async update(id: number, payload: UpdateEmployeePayload): Promise<Employee> {
        const {data} = await apiClient.patch<Employee>(`/empleados/${id}`, payload)

        return data
    },

    async deactivate(id: number): Promise<void> {
        await apiClient.delete(`/empleados/${id}`)
    },
}