import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { ToastProvider } from "@/toast/components/ToastProvider"
import { EmployeeForm } from "@/features/empleados/components/EmployeeForm"
import { employeesService } from "@/features/empleados/services/employeesService"
import { sucursalesService } from "@/features/sucursales/services/sucursalesService"
import { cargosService } from "@/features/cargos/services/cargosService"

vi.mock("@/features/empleados/services/employeesService", () => ({
  employeesService: {
    create: vi.fn(),
  },
}))

vi.mock("@/features/sucursales/services/sucursalesService", () => ({
  sucursalesService: {
    listActive: vi.fn(),
  },
}))

vi.mock("@/features/cargos/services/cargosService", () => ({
  cargosService: {
    listarActivos: vi.fn(),
  },
}))

const SUCURSAL_ACTIVA = {
  id: 3,
  name: "Sucursal Centro",
  city: "Medellín",
  phone: "",
  address: "Carrera 43A # 10-15",
  is_active: true,
  companyId: 1,
}

const CARGO_ACTIVO = {
  id: 4,
  name: "Mesero",
  description: null,
  is_active: true,
}

function renderFormulario(onSuccess = vi.fn()) {
  const user = userEvent.setup()

  render(
    <ToastProvider>
      <EmployeeForm onSuccess={onSuccess} />
    </ToastProvider>,
  )

  return { user, onSuccess }
}

/**
 * Las etiquetas de los campos obligatorios incluyen un "*" en un <span>
 * hijo, así que el texto accesible es "Nombre *", no "Nombre" exacto.
 */
function campo(texto: string) {
  return screen.getByLabelText(texto, { exact: false })
}

/** Espera a que los selectores de sucursal y cargo terminen de cargar. */
async function esperarCatalogosCargados() {
  await waitFor(() => {
    expect(campo("Sucursal")).not.toBeDisabled()
    expect(campo("Cargo")).not.toBeDisabled()
  })
}

async function completarFormularioValido(
  user: ReturnType<typeof userEvent.setup>,
  aceptarPolitica = true,
) {
  await esperarCatalogosCargados()

  await user.type(campo("Nombres"), "Julián")
  await user.type(campo("Apellidos"), "Ríos")
  await user.selectOptions(campo("Tipo de documento"), "CC")
  await user.type(campo("Número de documento"), "1333456789")
  await user.type(campo("Teléfono"), "3001234567")
  await user.selectOptions(campo("Cargo"), "Mesero")
  await user.selectOptions(campo("Sucursal"), "Sucursal Centro")
  await user.type(campo("Salario base"), "1000000")
  fireEvent.change(campo("Fecha de ingreso"), { target: { value: "2025-08-01" } })
  if (aceptarPolitica) await user.click(screen.getByRole("checkbox"))
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(sucursalesService.listActive).mockResolvedValue([SUCURSAL_ACTIVA])
  vi.mocked(cargosService.listarActivos).mockResolvedValue([CARGO_ACTIVO])
})

describe("EmployeeForm", () => {
  it("carga las sucursales y los cargos activos en los selectores", async () => {
    renderFormulario()

    await esperarCatalogosCargados()

    expect(
      screen.getByRole("option", { name: "Sucursal Centro" }),
    ).toBeInTheDocument()
    expect(screen.getByRole("option", { name: "Mesero" })).toBeInTheDocument()
  })

  it("registra el empleado con los datos del formulario y muestra un toast de éxito", async () => {
    vi.mocked(employeesService.create).mockResolvedValue({
      id: 20,
      firstName: "Julián",
      lastName: "Ríos",
      documentType: "CC",
      document: "1333456789",
      phone: "3001234567",
      salaryBase: 1000000,
      hireDate: "2025-08-01",
      position: "Mesero",
      status: "ACTIVO",
      branchId: 3,
      positionId: 4,
      branchName: "Sucursal Centro",
      positionName: "Mesero",
    })

    const { user, onSuccess } = renderFormulario()

    await completarFormularioValido(user)
    await user.click(screen.getByRole("button", { name: "Registrar empleado" }))

    await waitFor(() => {
      expect(employeesService.create).toHaveBeenCalledWith({
        firstName: "Julián",
        lastName: "Ríos",
        documentType: "CC",
        documentNumber: "1333456789",
        phone: "3001234567",
        salaryBase: 1000000,
        positionId: 4,
        branchId: 3,
        hireDate: "2025-08-01",
      })
    })

    expect(await screen.findByTestId("toast")).toHaveTextContent(
      "Empleado registrado correctamente.",
    )
    expect(onSuccess).toHaveBeenCalledTimes(1)
  })

  it("muestra los mensajes de validación cuando faltan campos obligatorios", async () => {
    const { user } = renderFormulario()

    await esperarCatalogosCargados()
    await user.click(screen.getByRole("button", { name: "Registrar empleado" }))

    expect(await screen.findByText("Los nombres son obligatorios.")).toBeInTheDocument()
    expect(screen.getByText("Los apellidos son obligatorios.")).toBeInTheDocument()
    expect(screen.getByText("El número de documento es obligatorio.")).toBeInTheDocument()
    expect(screen.getByText("El teléfono es obligatorio.")).toBeInTheDocument()
    expect(screen.getByText("El salario es obligatorio.")).toBeInTheDocument()
    expect(screen.getByText("La fecha de ingreso es obligatoria.")).toBeInTheDocument()
    expect(screen.getByText("Selecciona el cargo.")).toBeInTheDocument()
    expect(screen.getByText("Selecciona la sucursal.")).toBeInTheDocument()
    expect(
      screen.getByText("Debes aceptar la política de tratamiento de datos para registrar el empleado."),
    ).toBeInTheDocument()

    expect(employeesService.create).not.toHaveBeenCalled()
  })

  it("no registra el empleado si no acepta la política de tratamiento de datos", async () => {
    const { user } = renderFormulario()

    await completarFormularioValido(user, false)
    await user.click(screen.getByRole("button", { name: "Registrar empleado" }))

    expect(
      await screen.findByText("Debes aceptar la política de tratamiento de datos para registrar el empleado."),
    ).toBeInTheDocument()
    expect(employeesService.create).not.toHaveBeenCalled()
  })

  it("informa cuando el documento ya está registrado", async () => {
    vi.mocked(employeesService.create).mockRejectedValue({
      response: { status: 409, data: {} },
    })

    const { user } = renderFormulario()

    await completarFormularioValido(user)
    await user.click(screen.getByRole("button", { name: "Registrar empleado" }))

    expect(await screen.findByTestId("toast")).toHaveTextContent(
      "Ya existe un empleado con ese documento.",
    )
  })

  it("marca el número de documento inválido cuando contiene letras", async () => {
    const { user } = renderFormulario()

    await esperarCatalogosCargados()
    await user.type(campo("Número de documento"), "12AB")
    await user.tab()

    expect(
      await screen.findByText("El documento debe contener solo dígitos."),
    ).toBeInTheDocument()
  })
})
