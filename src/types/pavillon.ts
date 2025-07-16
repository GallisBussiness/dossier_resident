import type { Campus } from "./campus";

export interface CreatePavillon {
    nom:string;
    campusId:string;
    description?:string;
}

export interface UpdatePavillon {
    _id?:string;
    nom?:string;
    campusId?:string;
    description?:string;    
}

export interface Pavillon {
    _id?: string;
    nom: string;
    campusId: Campus;
    description?: string;
}
