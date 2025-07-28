import { equipementsApi } from "./api";
import type { Equipement } from "../types/equipement";

export const getEquipements = () => equipementsApi.get<Equipement[]>('');

export const createEquipement = (equipement: Equipement) => equipementsApi.post<Equipement>('', {json: equipement});

export const updateEquipement = (id: string, equipement: Equipement) => equipementsApi.put<Equipement>(`${id}`, {json: equipement});

export const deleteEquipement = (id: string) => equipementsApi.delete<Equipement>(`${id}`);
