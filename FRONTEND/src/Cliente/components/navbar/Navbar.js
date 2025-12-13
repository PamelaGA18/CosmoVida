// Componente alternativo para el avatar
const UserAvatar = ({ name, imageUrl }) => {
    const [hasError, setHasError] = useState(false);
    
    if (hasError || !imageUrl) {
        const initials = name ? name.charAt(0).toUpperCase() : 'U';
        return (
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 border-2 border-white flex items-center justify-center">
                <span className="text-white text-sm font-bold">{initials}</span>
            </div>
        );
    }
    
    return (
        <img
            src={imageUrl}
            alt={name || "Usuario"}
            className="h-8 w-8 rounded-full object-cover border-2 border-white"
            onError={() => setHasError(true)}
        />
    );
};