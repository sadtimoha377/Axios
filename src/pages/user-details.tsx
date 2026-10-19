import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { UserService } from "../api/user-service.js";
import type { User } from "../api/user-service.js";
import { findLocalUser } from "../api/local-users.js";

const UserDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState<User>();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | undefined>();

    useEffect(() => {
        const controller = new AbortController();

        const getUser = async () => {
            const localUser = findLocalUser(Number(id));

            if (localUser) {
                setUser(localUser);
                setIsLoading(false);
                return;
            }

            try {
                const data = await UserService.getUserById(Number(id), controller.signal);
                setUser(data);
            } catch (error) {
                if (!axios.isCancel(error)) {
                    setError(`Error while get data: ${error}`);
                }
            } finally {
                setIsLoading(false);
            }
        }

        getUser();

        return () => {
            controller.abort();
        }
    }, [id])

    if (isLoading) {
        return <h1 className="text-2xl">Data loading</h1>;
    }

    if (!user) {
        return (
            <div>
                <h1 className="text-4xl font-bold">User not found</h1>
                {error && <p className="text-red-900">{error}</p>}
                <button onClick={() => navigate(-1)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Back</button>
            </div>
        )
    }

    return (
        <div>
            <h1 className="text-4xl font-bold mb-4">{user.firstName} {user.lastName}</h1>

            <div className="border-2 border-blue-500 rounded p-4 mb-4">
                <p className="text-2xl">Id: {user.id}</p>
                <p className="text-2xl">Username: {user.username}</p>
                <p className="text-2xl">Age: {user.age}</p>
            </div>

            <Link to={`/users/${user.id}/edit`} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2">
                Edit
            </Link>
            <button onClick={() => navigate(-1)} className="border-2 border-blue-500 py-2 px-4 rounded">Back</button>
        </div>
    )
}

export default UserDetailsPage;
