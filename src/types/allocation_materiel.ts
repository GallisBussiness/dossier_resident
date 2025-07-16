import type { Dossier } from "./dossier";

export interface AllocationMateriel {
    date:string;
    dossierId:Dossier;
    nom:string;
    nombre:number;
    description?:string;
    etat:string;
}

export interface CreateAllocationMateriel {
    date:string;
    dossierId:string;
    nom:string;
    nombre:number;
    description?:string;
    etat:string;
}

export interface UpdateAllocationMateriel {
    date?:string;
    dossierId?:string;
    nom?:string;
    nombre?:number;
    description?:string;
    etat?:string;
}

