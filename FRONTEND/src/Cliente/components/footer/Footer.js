export default function Footer() {
    return (
        <footer className="bg-gradient-to-r from-[#6A5A8C] to-[#A6789F]">
            <div className="mx-auto w-full max-w-screen-xl p-6 lg:py-8">

                {/* IZQUIERDA vs DERECHA */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-start">

                    {/* IZQUIERDA */}
                    <div className="mb-6 md:mb-0 pl-4">
                        <a href="#" className="flex items-center">
                            <span className="self-center text-3xl font-semibold text-white">
                                CosmoVida
                            </span>
                        </a>
                    </div>

                    {/* DERECHA */}
                    <div className="pr-4">
                        <h2 className="mb-4 text-sm font-semibold uppercase text-white">
                            Recursos
                        </h2>

                        <ul className="text-gray-100 font-medium space-y-3">

                            {/* Instagram con icono A LA IZQUIERDA del texto */}
                            <li>
                                <a 
                                    href="https://www.instagram.com/liza_c2?igsh=NWkwbDk3OXBrcm44"
                                    className="flex items-center gap-2 hover:underline"
                                >
                                    {/* Icono a la izquierda */}
                                    <img
                                        src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png"
                                        className="h-5 w-5"
                                        alt="Instagram"
                                    />

                                    Instagram Distribuidora
                                </a>
                            </li>

                            <li>
                                <a 
                                    href="https://www.nuskin.com/content/nuskin/es_MX/home.html"
                                    className="hover:underline"
                                >
                                    Belleza y bienestar (skincare)
                                </a>
                            </li>

                        </ul>
                    </div>
                </div>

                <hr className="my-6 border-gray-100 sm:mx-auto lg:my-8" />
            </div>
        </footer>
    );
}
