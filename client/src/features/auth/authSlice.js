import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

export const initializeAuth = createAsyncThunk('auth/initialize', async () => {
  try {
    const stored = localStorage.getItem('skillify_auth')
    if (stored) return JSON.parse(stored)
  } catch { /* ignore */ }
  return null
})

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isInitialized: false,
  },
  reducers: {
    setCredentials: (state, { payload }) => {
      if (payload.user !== undefined) state.user = payload.user
      if (payload.accessToken) state.accessToken = payload.accessToken
      state.isAuthenticated = true
      localStorage.setItem('skillify_auth', JSON.stringify({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: true,
      }))
    },
    clearCredentials: (state) => {
      state.user = null
      state.accessToken = null
      state.isAuthenticated = false
      localStorage.removeItem('skillify_auth')
    },
    updateUser: (state, { payload }) => {
      state.user = { ...state.user, ...payload }
      if (state.isAuthenticated) {
        localStorage.setItem('skillify_auth', JSON.stringify({
          user: state.user,
          accessToken: state.accessToken,
          isAuthenticated: true,
        }))
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeAuth.fulfilled, (state, { payload }) => {
        if (payload) {
          state.user = payload.user
          state.accessToken = payload.accessToken
          state.isAuthenticated = payload.isAuthenticated || false
        }
        state.isInitialized = true
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.isInitialized = true
      })
  },
})

export const { setCredentials, clearCredentials, updateUser } = authSlice.actions
export default authSlice.reducer
