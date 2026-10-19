import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { UserService } from "../api/user-service.js";
import type { User } from "../api/user-service.js";
import { applyLocalChanges, saveDeletedUser } from "../api/local-users.js";

const UsersListPage = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | undefined>();
    const [deletingId, setDeletingId] = useState<number | undefined>();

    useEffect(() => {
        const controller = new AbortController();

        const getUsers = async () => {
            try {
                const data = await UserService.getUsers(controller.signal);
                setUsers(applyLocalChanges(data));
            } catch (error) {
                if (!axios.isCancel(error)) {
                    setError(`Error while get data: ${error}`);
                }
            } finally {
                setIsLoading(false);
            }
        }

        getUsers();

        return () => {
            controller.abort();
        }
    }, [])

    const handleDelete = async (id: number) => {
        setDeletingId(id);
        const controller = new AbortController();

        try {
            await UserService.deleteUser(id, controller.signal);
            saveDeletedUser(id);
            setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
        } catch (error) {
            setError(`Error while delete: ${error}`);
        } finally {
            setDeletingId(undefined);
        }
    }

    if (isLoading) {
        return <h1 className="text-2xl">Data loading</h1>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-4xl font-bold">Users</h1>
                <Link to="/users/new" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Create user
                </Link>
            </div>

            {error && <p className="text-red-900">{error}</p>}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {users.map((user) => (
                    <div key={user.id} className="border-2 border-blue-500 rounded p-4">
                        <h2 className="text-2xl font-bold">{user.firstName} {user.lastName}</h2>
                        <p>Username: {user.username}</p>
                        <p className="mb-2">Age: {user.age}</p>

                        <Link to={`/users/${user.id}`} className="text-blue-600 underline mr-4">Open</Link>
                        <Link to={`/users/${user.id}/edit`} className="text-blue-600 underline mr-4">Edit</Link>
                        <button
                            onClick={() => handleDelete(user.id)}
                            disabled={deletingId === user.id}
                            className="bg-red-700 hover:bg-red-900 text-white py-1 px-3 rounded disabled:opacity-50"
                        >
                            {deletingId === user.id ? "Deleting..." : "Delete"}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default UsersListPage;
