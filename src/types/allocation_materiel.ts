import type { Dossier } from "./dossier";

export interface AllocationMateriel {
    _id?: string;
    date: string;
    dossierId: Dossier;
    equipementId: string;
    nombre: number;
    description?: string;
    constatation: string;
}

export interface CreateAllocationMateriel {
    date: Date;
    dossierId: string;
    equipementId: string;
    nombre: number;
    description?: string;
    constatation: string;
}

export interface UpdateAllocationMateriel {
    date?: Date;
    dossierId?: string;
    equipementId?: string;
    nombre?: number;
    description?: string;
    constatation?: string;
}
