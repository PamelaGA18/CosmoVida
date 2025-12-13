const stats = [
    { id: 1, name: 'Calidad garantizada', value: '100%' },
    { id: 2, name: 'Tiempo promedio de entrega', value: '24–48 hrs' },
    { id: 3, name: 'Contacto', value: 'cosmovida@gmail.com' },
];

export default function Stats() {
    return (
        <div className="relative bg-gradient-to-r from-[#FDE2E4] via-[#EADCF8] to-[#CDEAF7] py-24 sm:py-32 overflow-hidden">
            {/* Efecto de profundidad con elementos decorativos */}
            <div className="absolute inset-0">
                <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-200/20 rounded-full blur-xl"></div>
                <div className="absolute bottom-1/3 right-1/4 w-40 h-40 bg-pink-200/20 rounded-full blur-xl"></div>
                <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-blue-200/20 rounded-full blur-xl"></div>
            </div>
            
            <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
                <dl className="grid grid-cols-1 gap-x-8 gap-y-16 text-center lg:grid-cols-3">
                    {stats.map((stat) => (
                        <div 
                            key={stat.id} 
                            className="mx-auto flex max-w-xs flex-col gap-y-4 p-8 rounded-3xl backdrop-blur-md bg-white/30 border border-white/40 shadow-2xl hover:bg-white/40 transition-all duration-300 hover:scale-105"
                        >
                            <dt className="text-base text-gray-700 font-sans font-semibold drop-shadow-sm">
                                {stat.name}
                            </dt>
                            <dd className={`order-first font-bold tracking-tight font-sans ${
                                stat.id === 3
                                    ? 'text-base sm:text-lg text-purple-600 drop-shadow-sm' // más suave
                                    : 'text-3xl sm:text-5xl text-gray-900 drop-shadow-sm'
                                }`}>
                                {stat.id === 3 ? (
                                    <a 
                                        href={`mailto:${stat.value}`} 
                                        className="hover:underline hover:text-purple-700 transition-colors duration-200"
                                    >
                                        {stat.value}
                                    </a>
                                ) : (
                                    stat.value
                                )}
                            </dd>
                        </div>
                    ))}
                </dl>
                
                {/* Línea decorativa inferior */}
                <div className="mt-16 pt-8 border-t border-white/30">
                    <p className="text-center text-gray-600/80 font-sans text-sm">
                        Comprometidos con tu satisfacción
                    </p>
                </div>
            </div>
        </div>
    );
}