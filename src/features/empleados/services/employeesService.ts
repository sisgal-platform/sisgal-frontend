import apiClient from "@/lib/axios";
import type { Employee, EmployeeListFilters, RegisterEmployeePayload } from "../interfaces/types";


export const employeesService = {
    async create(payload: RegisterEmployeePayload): Promise<Employee> {
        const {data} = await apiClient.post<Employee>('/empleados', payload)

        return data
    },

    async list(filters: EmployeeListFilters = {}): Promise<Employee[]> {
        const {data} = await apiClient.get<Employee[]>('/empleados', { params: filters })

        return data
    },
}