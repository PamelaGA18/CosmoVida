import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Alert from "../../../basicUtilityComp/alert/Alert";
import { baseUrl } from "../../../environment";

export default function UsersAdmin() {
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState("success");

    const handleMessageClear = () => {
        setMessage("");
        setMessageType("success");
    }
    const [users, setUsers] = useState([]);

    const handleUserDelete = (id) => {
        if (window.confirm("¿Estas seguro de eliminar?")) {
            axios.delete(`${baseUrl}/user/${id}`).then(resp => {
                console.log("Eliminar usuario", resp)
                setMessage(resp.data.message);
                setMessageType("success")
            }).catch(e => {
                setMessage(e.response.data.message);
                setMessageType("error")
                console.log("Error en eliminar", e)
            })

        }
    }

    const convertDate = (dateData) => {
        const date = new Date(dateData);
        return date.getDate() + '-' + (+date.getMonth() + 1) + '-' + date.getFullYear()
    }
    const fetchUsers = () => {
        axios.get(`${baseUrl}/user`).then(resp => {
            console.log("user response", resp);
            setUsers(resp.data.users)
        }).catch(e => {
            console.log("Errors", e)
        })
    }

    useEffect(() => {
        fetchUsers()
    }, [message])
    return (<>
        {message && <Alert message={message} type={messageType} handleMessageClear={handleMessageClear} />}
        <h1 className="m-auto  text-center text-[24px] font bold">Usuarios</h1>
        <table className="table-auto w-full">
            <thead className="bg-gray-500">
                <tr >
                    <th className="p-2">Nombre</th>
                    <th>Correo electrónico</th>
                    <th>Fecha de registro</th>
                    <th>Rol</th>
                    <th>Acción</th>
                </tr>
            </thead>
            <tbody>
                {users && users.map((user, i) => {
                    return (
                        <tr key={1}>
                            <td className="p-2" align="center">{user.name}</td>
                            <td align="center">{user.email}</td>
                            <td align="center">{convertDate(user.createdAt)}</td>
                            <td align="center">{user.role}</td>
                            <td align="center"><button className="bg-red-600 px-2 text-white rounded" onClick={() => { handleUserDelete(user._id) }}>Eliminar</button></td>
                        </tr>
                    )
                })}


            </tbody>
        </table>
    </>)
}