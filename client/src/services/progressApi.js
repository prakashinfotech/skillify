import { createApi } from '@reduxjs/toolkit/query/react'
import { axiosBaseQuery } from '../utils/axiosBaseQuery'

export const progressApi = createApi({
  reducerPath: 'progressApi',
  baseQuery: axiosBaseQuery({ baseUrl: '/api/v1' }),
  tagTypes: ['Progress'],
  endpoints: (builder) => ({
    getProgressOverview: builder.query({
      query: () => ({ url: '/progress/overview', method: 'GET' }),
      providesTags: ['Progress'],
    }),
    getCourseProgress: builder.query({
      query: (courseId) => ({ url: `/progress/course/${courseId}`, method: 'GET' }),
      providesTags: (result, error, courseId) => [{ type: 'Progress', id: courseId }],
    }),
    getAllStudentsProgress: builder.query({
      query: (courseId) => ({ url: `/progress/course/${courseId}/all`, method: 'GET' }),
    }),
    getStudentProgress: builder.query({
      query: ({ studentId, courseId }) => ({
        url: `/progress/student/${studentId}/course/${courseId}`,
        method: 'GET',
      }),
    }),
  }),
})

export const {
  useGetProgressOverviewQuery,
  useGetCourseProgressQuery,
  useGetAllStudentsProgressQuery,
  useGetStudentProgressQuery,
} = progressApi
