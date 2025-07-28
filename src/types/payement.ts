import type { Dossier } from "./dossier";

export enum Mois {
    JANVIER = 'JANVIER',
    FEBRER = 'FEVRIER',
    MARS = 'MARS',
    AVRIL = 'AVRIL',
    MAI = 'MAI',
    JUIN = 'JUIN',
    JUILLET = 'JUILLET',
    AOUT = 'AOUT',
    SEPTEMBRE = 'SEPTEMBRE',
    OCTOBRE = 'OCTOBRE',
    NOVEMBRE = 'NOVEMBRE',
    DECEMBRE = 'DECEMBRE'
}

export interface Payement {
    _id?:string;
    dossierId:Dossier;

    montant:number;

    mois:Mois;

    numero_facture:string;
}

export interface CreatePayement {
    dossierId:string;

    montant:number;

    mois:Mois;

    numero_facture:string;
}

export interface UpdatePayement {
    dossierId?:string;

    montant?:number;

    mois?:Mois;

    numero_facture?:string;
}

