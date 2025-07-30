export interface AnneeUniversitaire {
    _id: string;
    nom: string;
    isActif: boolean;
}

export interface CreateAnneeUniversitaire {
    nom:string;
    isActif:boolean;
}

export interface UpdateAnneeUniversitaire {
    nom?:string;
    isActif?:boolean;
}

export interface Importations {
    anneeFrom:string;
    anneeTo:string;
}
