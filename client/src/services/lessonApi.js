import { createApi } from '@reduxjs/toolkit/query/react'
import { axiosBaseQuery } from '../utils/axiosBaseQuery'

export const lessonApi = createApi({
  reducerPath: 'lessonApi',
  baseQuery: axiosBaseQuery({ baseUrl: '/api/v1' }),
  tagTypes: ['Lesson', 'Progress'],
  endpoints: (builder) => ({
    getLessonsByCourse: builder.query({
      query: (courseId) => ({ url: `/lessons/course/${courseId}`, method: 'GET' }),
      providesTags: ['Lesson'],
    }),
    getLessonById: builder.query({
      query: (id) => ({ url: `/lessons/${id}`, method: 'GET' }),
      providesTags: (result, error, id) => [{ type: 'Lesson', id }],
    }),
    createLesson: builder.mutation({
      query: (data) => ({ url: '/lessons', method: 'POST', data }),
      invalidatesTags: ['Lesson'],
    }),
    updateLesson: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/lessons/${id}`, method: 'PUT', data }),
      invalidatesTags: ['Lesson'],
    }),
    deleteLesson: builder.mutation({
      query: (id) => ({ url: `/lessons/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Lesson'],
    }),
    reorderLesson: builder.mutation({
      query: ({ id, order }) => ({ url: `/lessons/${id}/reorder`, method: 'PATCH', data: { order } }),
      invalidatesTags: ['Lesson'],
    }),
    completeLesson: builder.mutation({
      query: (id) => ({ url: `/lessons/${id}/complete`, method: 'POST' }),
      invalidatesTags: ['Progress'],
    }),
  }),
})

export const {
  useGetLessonsByCourseQuery,
  useGetLessonByIdQuery,
  useCreateLessonMutation,
  useUpdateLessonMutation,
  useDeleteLessonMutation,
  useReorderLessonMutation,
  useCompleteLessonMutation,
} = lessonApi
