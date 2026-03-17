import { CrudService } from '@/core/crud';
import type { Book, Course, Movie, Article, Note } from '../entities';

export class BookService extends CrudService<Book> {
  constructor() {
    super('books');
  }

  async getByStatus(status: Book['status']): Promise<Book[]> {
    return await this.findByField('status', status);
  }

  async getReadingBooks(): Promise<Book[]> {
    return await this.getByStatus('reading');
  }

  async updateProgress(bookId: string, pagesRead: number): Promise<void> {
    const book = await this.getById(bookId);
    if (!book || !book.pages_total) return;

    const progress = Math.round((pagesRead / book.pages_total) * 100);
    const status: Book['status'] = progress >= 100 ? 'completed' : 'reading';

    await this.update(bookId, {
      pages_read: pagesRead,
      status,
      finished_at: status === 'completed' ? Date.now() : book.finished_at,
    } as any); // eslint-disable-line @typescript-eslint/no-explicit-any
  }
}

export class CourseService extends CrudService<Course> {
  constructor() {
    super('courses');
  }

  async getByStatus(status: Course['status']): Promise<Course[]> {
    return await this.findByField('status', status);
  }

  async updateProgress(courseId: string, progress: number): Promise<void> {
    const course = await this.getById(courseId);
    if (!course) return;

    const status: Course['status'] = progress >= 100 ? 'completed' : 'in_progress';

    await this.update(courseId, {
      progress,
      status,
      finished_at: status === 'completed' ? Date.now() : course.finished_at,
    });
  }
}

export class MovieService extends CrudService<Movie> {
  constructor() {
    super('movies');
  }

  async getByStatus(status: Movie['status']): Promise<Movie[]> {
    return await this.findByField('status', status);
  }

  async getByType(type: Movie['type']): Promise<Movie[]> {
    return await this.findByField('type', type);
  }
}

export class ArticleService extends CrudService<Article> {
  constructor() {
    super('articles');
  }

  async getByStatus(status: Article['status']): Promise<Article[]> {
    return await this.findByField('status', status);
  }

  async getByTag(tag: string): Promise<Article[]> {
    const all = await this.getAll();
    return all.filter((a) => a.tags.includes(tag));
  }

  async getUnread(): Promise<Article[]> {
    const all = await this.getAll();
    return all.filter((a) => a.status === 'saved' || a.status === 'reading');
  }
}

export class NoteService extends CrudService<Note> {
  constructor() {
    super('notes');
  }

  async getFavorites(): Promise<Note[]> {
    const all = await this.getAll();
    return all.filter((n) => n.is_favorite);
  }

  async getByTag(tag: string): Promise<Note[]> {
    const all = await this.getAll();
    return all.filter((n) => n.tags.includes(tag));
  }

  async searchByTitle(query: string): Promise<Note[]> {
    const all = await this.getAll();
    return all.filter(
      (n) =>
        n.title.toLowerCase().includes(query.toLowerCase()) ||
        n.content.toLowerCase().includes(query.toLowerCase())
    );
  }
}
