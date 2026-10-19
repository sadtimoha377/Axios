import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { UserService } from "../api/user-service.js";
import type { User } from "../api/user-service.js";
import { saveCreatedUser, saveUpdatedUser, findLocalUser, isCreatedLocally } from "../api/local-users.js";
import { userSchema } from "../schemas/userSchema.js";
import type { UserFormData } from "../schemas/userSchema.js";

const UserFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const isEditMode = Boolean(id);

    const [isLoading, setIsLoading] = useState(isEditMode);
    const [error, setError] = useState<string | undefined>();
    const [result, setResult] = useState<object>();

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<UserFormData>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            username: '',
            age: 18
        }
    });

    useEffect(() => {
        if (!isEditMode) {
            return;
        }

        const controller = new AbortController();

        const getUser = async () => {
            const localUser = findLocalUser(Number(id));

            if (localUser) {
                reset({
                    firstName: localUser.firstName,
                    lastName: localUser.lastName,
                    username: localUser.username,
                    age: localUser.age
                });
                setIsLoading(false);
                return;
            }

            try {
                const user = await UserService.getUserById(Number(id), controller.signal);

                reset({
                    firstName: user.firstName,
                    lastName: user.lastName,
                    username: user.username,
                    age: user.age
                });
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
    }, [id, isEditMode, reset])

    const onSubmit: SubmitHandler<UserFormData> = async (data) => {
        setError(undefined);
        const controller = new AbortController();

        try {
            let response: User;

            if (!isEditMode) {
                response = await UserService.addUser(data, controller.signal);
                saveCreatedUser(response);
                reset();
            } else if (isCreatedLocally(Number(id))) {
                response = { id: Number(id), ...data };
                saveUpdatedUser(response);
            } else {
                response = await UserService.updateUser(Number(id), data, controller.signal);
                saveUpdatedUser(response);
            }

            setResult(response);
        } catch (error) {
            setError(`Error while send data: ${error}`);
        }
    }

    if (isLoading) {
        return <h1 className="text-2xl">Data loading</h1>;
    }

    return (
        <div>
            <h1 className="text-4xl font-bold mb-4">{isEditMode ? "Update user" : "Create user"}</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="max-w-md">
                <div className="mb-2">
                    <label htmlFor="firstName" className="block">First name</label>
                    <input id="firstName" className="border-2 border-blue-500 rounded p-1 w-full" {...register('firstName')} />
                    {errors.firstName && <p className="text-red-900">{errors.firstName.message}</p>}
                </div>

                <div className="mb-2">
                    <label htmlFor="lastName" className="block">Last name</label>
                    <input id="lastName" className="border-2 border-blue-500 rounded p-1 w-full" {...register('lastName')} />
                    {errors.lastName && <p className="text-red-900">{errors.lastName.message}</p>}
                </div>

                <div className="mb-2">
                    <label htmlFor="username" className="block">Username</label>
                    <input id="username" className="border-2 border-blue-500 rounded p-1 w-full" {...register('username')} />
                    {errors.username && <p className="text-red-900">{errors.username.message}</p>}
                </div>

                <div className="mb-2">
                    <label htmlFor="age" className="block">Age</label>
                    <input id="age" type="number" className="border-2 border-blue-500 rounded p-1 w-full" {...register('age', { valueAsNumber: true })} />
                    {errors.age && <p className="text-red-900">{errors.age.message}</p>}
                </div>

                <button type="submit" disabled={isSubmitting} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2 disabled:opacity-50">
                    {isSubmitting ? "Sending..." : (isEditMode ? "Update" : "Create")}
                </button>
                <button type="button" onClick={() => navigate('/users')} className="border-2 border-blue-500 py-2 px-4 rounded">
                    To the list
                </button>
            </form>

            {error && <p className="text-red-900">{error}</p>}

            {result &&
                <div className="mt-4">
                    <h2 className="text-2xl font-bold">Response</h2>
                    <pre className="border-2 border-blue-500 rounded p-2">{JSON.stringify(result, null, 2)}</pre>
                </div>}
        </div>
    )
}

export default UserFormPage;
