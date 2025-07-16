import { usersApi } from "./api";
import type { LoginUser, CreateUser, User, LoginResponse } from "../types/user";

// Fonction pour créer un utilisateur avec Better Auth
export const createUser = async (data: CreateUser): Promise<User> => {
    return await usersApi.post('', { json: data }).json();
};

export const login = async (data: LoginUser): Promise<LoginResponse> => {
    return await usersApi.post('login', { json: data }).json();
};
    