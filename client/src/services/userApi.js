import { createApi } from '@reduxjs/toolkit/query/react'
import { axiosBaseQuery } from '../utils/axiosBaseQuery'

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: axiosBaseQuery({ baseUrl: '/api/v1' }),
  tagTypes: ['User'],
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: (params) => ({ url: '/users', method: 'GET', params }),
      providesTags: ['User'],
    }),
    getUserById: builder.query({
      query: (id) => ({ url: `/users/${id}`, method: 'GET' }),
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),
    updateUserStatus: builder.mutation({
      query: ({ id, isActive }) => ({ url: `/users/${id}/status`, method: 'PATCH', data: { isActive } }),
      invalidatesTags: ['User'],
    }),
    deleteUser: builder.mutation({
      query: (id) => ({ url: `/users/${id}`, method: 'DELETE' }),
      invalidatesTags: ['User'],
    }),
    getUserStats: builder.query({
      query: (id) => ({ url: `/users/${id}/stats`, method: 'GET' }),
    }),
    getMe: builder.query({
      query: () => ({ url: '/users/me', method: 'GET' }),
      providesTags: ['User'],
    }),
    updateMe: builder.mutation({
      query: (data) => ({ url: '/users/update-me', method: 'PATCH', data }),
      invalidatesTags: ['User'],
    }),
    requestEmailUpdate: builder.mutation({
      query: (data) => ({ url: '/users/request-email-update', method: 'POST', data }),
    }),
    verifyEmailUpdate: builder.mutation({
      query: (data) => ({ url: '/users/verify-email-update', method: 'POST', data }),
      invalidatesTags: ['User'],
    }),
  }),
})

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserStatusMutation,
  useDeleteUserMutation,
  useGetUserStatsQuery,
  useGetMeQuery,
  useUpdateMeMutation,
  useRequestEmailUpdateMutation,
  useVerifyEmailUpdateMutation,
} = userApi
