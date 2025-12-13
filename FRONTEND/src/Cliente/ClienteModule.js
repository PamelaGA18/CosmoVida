import { Outlet } from "react-router-dom"
import Navbar from "./components/navbar/Navbar"
import Footer from "./components/footer/Footer"

export default function ClienteModule() {
    return (
        <>
            <Navbar />
            <div style={{"minHeight":"70vh"}} className="bg-gradient-to-r from-[#F7C8D0] via-[#EADCF8] to-[#C7E8F3]">
                <Outlet />
            </div>

            <Footer />
        </>
    )
}