import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    total:0
}

export const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        updateTotal: (state, action) => {
            state.total=action.payload;
        }
    },
})

// Action creators...
export const { updateTotal } = cartSlice.actions;

export default cartSlice.reducer