import { createApi } from '@reduxjs/toolkit/query/react'
import { axiosBaseQuery } from '../utils/axiosBaseQuery'

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: axiosBaseQuery({ baseUrl: '/api/v1' }),
  tagTypes: ['AdminStats', 'PendingCourses', 'Charts'],
  endpoints: (builder) => ({
    getAdminStats: builder.query({
      query: () => ({ url: '/admin/stats', method: 'GET' }),
      providesTags: ['AdminStats'],
    }),
    getPendingCourses: builder.query({
      query: () => ({ url: '/admin/pending-courses', method: 'GET' }),
      providesTags: ['PendingCourses'],
    }),
    getEnrollmentsChart: builder.query({
      query: () => ({ url: '/admin/enrollments-chart', method: 'GET' }),
      providesTags: ['Charts'],
    }),
    getUsersChart: builder.query({
      query: () => ({ url: '/admin/users-chart', method: 'GET' }),
      providesTags: ['Charts'],
    }),
    getTopCourses: builder.query({
      query: () => ({ url: '/admin/top-courses', method: 'GET' }),
    }),
  }),
})

export const {
  useGetAdminStatsQuery,
  useGetPendingCoursesQuery,
  useGetEnrollmentsChartQuery,
  useGetUsersChartQuery,
  useGetTopCoursesQuery,
} = adminApi
