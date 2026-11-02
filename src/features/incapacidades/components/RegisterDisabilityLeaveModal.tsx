import { useState } from "react"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

import type { DisabilityLeave } from "../interfaces/types"
import { RegisterDisabilityLeaveForm } from "./RegisterDisabilityLeaveForm"

type RegisterDisabilityLeaveModalProps = {
    onSuccess?: () => void
}

export function RegisterDisabilityLeaveModal({ onSuccess }: RegisterDisabilityLeaveModalProps = {}) {
    const [open, setOpen] = useState(false)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    type="button"
                    className="flex items-center gap-2 bg-primary hover:bg-primary-light"
                >
                    <Plus size={18} aria-hidden="true" />
                    Registrar incapacidad
                </Button>
            </DialogTrigger>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Registrar incapacidad o licencia</DialogTitle>
                </DialogHeader>

                <RegisterDisabilityLeaveForm
                    onSuccess={() => {
                        setOpen(false)
                        onSuccess?.()
                    }}
                />
            </DialogContent>
        </Dialog>
    )
}

type EditDisabilityLeaveModalProps = Readonly<{
    disabilityLeave: DisabilityLeave
    onClose: () => void
    onSuccess: () => void
}>

export function EditDisabilityLeaveModal({
    disabilityLeave,
    onClose,
    onSuccess,
}: EditDisabilityLeaveModalProps) {
    return (
        <Dialog
            open
            onOpenChange={(open) => {
                if (!open) onClose()
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Editar incapacidad o licencia</DialogTitle>
                </DialogHeader>

                <RegisterDisabilityLeaveForm
                    disabilityLeave={disabilityLeave}
                    onSuccess={onSuccess}
                />
            </DialogContent>
        </Dialog>
    )
}
