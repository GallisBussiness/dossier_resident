import type { Pavillon } from "./pavillon";

export interface Chambre {
    _id?: string;
    nom:string;
    pavillonId:Pavillon | string;
    places:number;
    anneeUniversitaireId?: string;
}

export interface CreateChambre {
    nom:string;
    pavillonId:string;
    places?:number;
    anneeUniversitaireId?: string;
}   

export interface UpdateChambre {
    _id?: string;
    nom?:string;
    pavillonId?:string;
    places?:number;
    anneeUniversitaireId?: string;
}
    