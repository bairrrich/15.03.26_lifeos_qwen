'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BookService, CourseService, MovieService, ArticleService, NoteService } from '../services';
import type { Book, Course, Movie, Article, Note } from '../entities';

const bookService = new BookService();
const courseService = new CourseService();
const movieService = new MovieService();
const articleService = new ArticleService();
const noteService = new NoteService();

// Books
export function useBooks() {
  return useQuery({
    queryKey: ['books'],
    queryFn: () => bookService.getAll(),
  });
}

export function useReadingBooks() {
  return useQuery({
    queryKey: ['books', 'reading'],
    queryFn: () => bookService.getReadingBooks(),
  });
}

export function useCreateBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      data: Omit<
        Book,
        | 'id'
        | 'created_at'
        | 'updated_at'
        | 'deleted_at'
        | 'version'
        | 'sync_status'
        | 'last_synced_at'
      >
    ) => bookService.create({ ...data, user_id: 'current-user' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
}

// Courses
export function useCourses() {
  return useQuery({
    queryKey: ['courses'],
    queryFn: () => courseService.getAll(),
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      data: Omit<
        Course,
        | 'id'
        | 'created_at'
        | 'updated_at'
        | 'deleted_at'
        | 'version'
        | 'sync_status'
        | 'last_synced_at'
      >
    ) => courseService.create({ ...data, user_id: 'current-user' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

// Movies
export function useMovies() {
  return useQuery({
    queryKey: ['movies'],
    queryFn: () => movieService.getAll(),
  });
}

export function useCreateMovie() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      data: Omit<
        Movie,
        | 'id'
        | 'created_at'
        | 'updated_at'
        | 'deleted_at'
        | 'version'
        | 'sync_status'
        | 'last_synced_at'
      >
    ) => movieService.create({ ...data, user_id: 'current-user' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
    },
  });
}

// Articles
export function useArticles() {
  return useQuery({
    queryKey: ['articles'],
    queryFn: () => articleService.getAll(),
  });
}

export function useUnreadArticles() {
  return useQuery({
    queryKey: ['articles', 'unread'],
    queryFn: () => articleService.getUnread(),
  });
}

export function useCreateArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      data: Omit<
        Article,
        | 'id'
        | 'created_at'
        | 'updated_at'
        | 'deleted_at'
        | 'version'
        | 'sync_status'
        | 'last_synced_at'
      >
    ) => articleService.create({ ...data, user_id: 'current-user' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
  });
}

// Notes
export function useNotes() {
  return useQuery({
    queryKey: ['notes'],
    queryFn: () => noteService.getAll(),
  });
}

export function useFavoriteNotes() {
  return useQuery({
    queryKey: ['notes', 'favorites'],
    queryFn: () => noteService.getFavorites(),
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      data: Omit<
        Note,
        | 'id'
        | 'created_at'
        | 'updated_at'
        | 'deleted_at'
        | 'version'
        | 'sync_status'
        | 'last_synced_at'
      >
    ) => noteService.create({ ...data, user_id: 'current-user' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
}

export function useSearchNotes(query: string) {
  return useQuery({
    queryKey: ['notes', 'search', query],
    queryFn: () => (query ? noteService.searchByTitle(query) : Promise.resolve([])),
    enabled: query.length > 0,
  });
}
