import type { Pavillon } from "./pavillon";

export interface Chambre {
    _id?: string;
    nom:string;
    pavillonId:Pavillon | string;
    places:number;
}

export interface CreateChambre {
    nom:string;
    pavillonId:string;
    places?:number;
}   

export interface UpdateChambre {
    _id?: string;
    nom?:string;
    pavillonId?:string;
    places?:number;
}
    