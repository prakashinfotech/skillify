import { createApi } from '@reduxjs/toolkit/query/react'
import { axiosBaseQuery } from '../utils/axiosBaseQuery'

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: axiosBaseQuery({ baseUrl: '/api/v1' }),
  tagTypes: ['Auth'],
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (data) => ({ url: '/auth/login', method: 'POST', data }),
      invalidatesTags: ['Auth'],
    }),
    register: builder.mutation({
      query: (data) => ({ url: '/auth/register', method: 'POST', data }),
    }),
    logout: builder.mutation({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
      invalidatesTags: ['Auth'],
    }),
    refresh: builder.mutation({
      query: () => ({ url: '/auth/refresh', method: 'POST' }),
    }),
    getMe: builder.query({
      query: () => ({ url: '/auth/me', method: 'GET' }),
      providesTags: ['Auth'],
    }),
    updateProfile: builder.mutation({
      query: (data) => ({ url: '/auth/me/profile', method: 'PUT', data }),
      invalidatesTags: ['Auth'],
    }),
    updatePassword: builder.mutation({
      query: (data) => ({ url: '/auth/me/password', method: 'PUT', data }),
    }),
    forgotPassword: builder.mutation({
      query: (data) => ({ url: '/auth/forgot-password', method: 'POST', data }),
    }),
    resetPassword: builder.mutation({
      query: ({ token, password }) => ({ url: `/auth/reset-password/${token}`, method: 'PUT', data: { password } }),
    }),
  }),
})

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useRefreshMutation,
  useGetMeQuery,
  useUpdateProfileMutation,
  useUpdatePasswordMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi
