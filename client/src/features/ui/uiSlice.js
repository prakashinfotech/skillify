import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: { sidebarOpen: true, sidebarCollapsed: false },
  reducers: {
    toggleSidebar: (state) => { state.sidebarOpen = !state.sidebarOpen },
    setSidebarCollapsed: (state, { payload }) => { state.sidebarCollapsed = payload },
  },
})

export const { toggleSidebar, setSidebarCollapsed } = uiSlice.actions
export default uiSlice.reducer
