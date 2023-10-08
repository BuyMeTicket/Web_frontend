import { createSlice } from '@reduxjs/toolkit'

export const loginSlice = createSlice({
  name: 'login',
  initialState: {
    isEventHolder: false,
  },
  reducers: {
    login: (state, action) => {
      state.isEventHolder = action.payload
    },
    logout: (state) => {
      state.isEventHolder = false
    },
  },
})

export const { login, logout } = loginSlice.actions
export const selectLogin = (state) => state.login
export default loginSlice.reducer
