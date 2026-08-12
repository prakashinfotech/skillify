import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import uiReducer from '../features/ui/uiSlice'
import { authApi } from '../services/authApi'
import { courseApi } from '../services/courseApi'
import { lessonApi } from '../services/lessonApi'
import { quizApi } from '../services/quizApi'
import { enrollmentApi } from '../services/enrollmentApi'
import { progressApi } from '../services/progressApi'
import { adminApi } from '../services/adminApi'
import { userApi } from '../services/userApi'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    [authApi.reducerPath]: authApi.reducer,
    [courseApi.reducerPath]: courseApi.reducer,
    [lessonApi.reducerPath]: lessonApi.reducer,
    [quizApi.reducerPath]: quizApi.reducer,
    [enrollmentApi.reducerPath]: enrollmentApi.reducer,
    [progressApi.reducerPath]: progressApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
  },
  middleware: (gDM) =>
    gDM().concat(
      authApi.middleware,
      courseApi.middleware,
      lessonApi.middleware,
      quizApi.middleware,
      enrollmentApi.middleware,
      progressApi.middleware,
      adminApi.middleware,
      userApi.middleware,
    ),
})
