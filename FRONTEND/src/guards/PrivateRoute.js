import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function PrivateRoute({ children }) {
    const [auth, setAuth] = useState(false);
    const [checked, setChecked] = useState(false)

    const navigate = useNavigate()
    useEffect(() => {
        const userDataStr = localStorage.getItem("userData");
        if (userDataStr) {
            const token = JSON.parse(userDataStr).token;
            if (token) {
                setAuth(true)
            }
        }
        setChecked(true)
    }, [])
    if (checked && auth) {
        return children;
    }

    if (checked && !auth) {
        navigate("/login")
    }

}