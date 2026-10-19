import api from "./dummy-json-instance.js";

export type User = {
    id: number;
    firstName: string;
    lastName: string;
    age: number;
    username: string;
}

export type NewUser = Omit<User, "id">;

export type DeletedUser = User & {
    isDeleted: boolean;
    deletedOn: string;
}

export class UserService{
    static getUsers = async(signal:AbortSignal):Promise<User[]>=>{
        const response = await api.get('/users', {signal});
        return response.data?.users;
    }
    static getUserById = async(id:number, signal:AbortSignal):Promise<User>=>{
        const response = await api.get(`/users/${id}`, {signal});
        return response.data;
    }
    static addUser = async(user:NewUser, signal:AbortSignal):Promise<User>=>{
        const response = await api.post('/users/add', user, {signal});
        return response.data;
    }
    static updateUser = async(id:number, user:Partial<NewUser>, signal:AbortSignal):Promise<User>=>{
        const response = await api.put(`/users/${id}`, user, {signal});
        return response.data;
    }
    static deleteUser = async(id:number, signal:AbortSignal):Promise<DeletedUser>=>{
        const response = await api.delete(`/users/${id}`, {signal});
        return response.data;
    }
}
