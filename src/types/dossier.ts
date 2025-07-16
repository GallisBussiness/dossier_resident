import type { Chambre } from "./chambre";
import type { AnneeUniversitaire } from "./annee_universitaire";

export interface Dossier {

    _id?:string;

    numero:string;

    chambreId:Chambre | string;

    etudiantId:string;

    anneeUniversitaireId:AnneeUniversitaire | string;

    active?:boolean;

    caution?:number;

    taux_loyer_mensuelle?:number;

    createdAt?:string;

    updatedAt?:string;
}

export interface CreateDossier {
    chambreId:Chambre | string;

    etudiantId:string;

    anneeUniversitaireId:AnneeUniversitaire | string;

    active?:boolean;

    caution?:number;

    taux_loyer_mensuelle?:number;
}

export interface UpdateDossier {
    _id?:string;
    chambreId?:Chambre | string;

    etudiantId?:string;

    anneeUniversitaireId?:AnneeUniversitaire | string;

    active?:boolean;

    caution?:number;

    taux_loyer_mensuelle?:number;
}

    
    