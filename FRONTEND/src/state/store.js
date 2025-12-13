import { configureStore } from "@reduxjs/toolkit"
import  authReducer  from "./authSlice"
import  cartSlice  from "./cartSlice"

export const store = configureStore({
    reducer: {
        auth: authReducer, 
        cart: cartSlice},
})