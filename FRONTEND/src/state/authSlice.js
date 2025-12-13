import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    auth: false,
    admin: false,
    userData: null, // <-- nuevo
}

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login: (state, action) => {
            console.log("=== AUTH SLICE - LOGIN ACTION ===");
            console.log("Payload recibido:", action.payload);
            state.auth = action.payload.auth;
            state.admin = action.payload.admin;
            state.userData = action.payload.userData || null; 
            console.log("Estado actualizado:", state);
        },
        logout: (state) => {
            state.auth = false;
            state.admin = false;
            state.userData = null; // <-- nuevo
        },
        setUserData: (state, action) => {
            state.userData = action.payload;
            state.admin = action.payload.role === 'admin';
        },
    },
})

// Action creators...
export const { login, logout, setUserData } = authSlice.actions;

export default authSlice.reducer;