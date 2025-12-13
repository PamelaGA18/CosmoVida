import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom"
import { logout } from "../../../state/authSlice";

export default function SignOut() {


    const navigate = useNavigate();
    const dispatch = useDispatch()

    useEffect(() => {
        localStorage.removeItem("userData")
        dispatch(logout())
        navigate("/login")

    }, [])
    return (<>
        sign out
    </>)
}