import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function PrivateAdminRoute({ children }) {
    const [auth, setAuth] = useState(false);
    const [admin, setAdmin] = useState(false)
    const [checked, setChecked] = useState(false)

    const navigate = useNavigate()
    useEffect(() => {
        const userDataStr = localStorage.getItem("userData");
        if (userDataStr) {
            const userData = JSON.parse(userDataStr);
            if (userData.token) {
                setAuth(true)
            }
            if (userData.role === "admin") {
                setAdmin(true)
            }
        }
        setChecked(true)
    }, [])
    if (checked && auth && admin) {
        return children;
    }else{
        navigate("/login")
    }

    //if (checked && (auth || admin)){
    //    navigate("/login")
    //}

}