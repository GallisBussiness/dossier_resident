import type { Dossier } from "./dossier";


export enum AllocationStatut {
    NEUF = 'NEUF',
    DETERIORE = 'DETERIORE',
}

export interface AllocationMateriel {
    _id?: string;
    date: string;
    dossierId: Dossier;
    nom: string;
    nombre: number;
    description?: string;
    etat: AllocationStatut;
}

export interface CreateAllocationMateriel {
    date: Date;
    dossierId: string;
    nom: string;
    nombre: number;
    description?: string;
    etat: AllocationStatut;
}

export interface UpdateAllocationMateriel {
    date?: Date;
    dossierId?: string;
    nom?: string;
    nombre?: number;
    description?: string;
    etat?: AllocationStatut;
}

/**
 * Statistiques des allocations pour un dossier
 */
export interface AllocationStats {
    totalItems: number;
    neufItems: number;
    deterioreItems: number;
    totalAllocations: number;
    lastAllocationDate: string | null;
}

/**
 * Résultat de validation des allocations
 */
export interface AllocationValidationResult {
    isValid: boolean;
    errors: string[];
}
