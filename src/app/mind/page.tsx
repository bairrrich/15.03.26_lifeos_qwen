'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useBooks,
  useCourses,
  useNotes,
  useCreateBook,
  useCreateCourse,
  useCreateNote,
} from '@/modules/mind/hooks';
import { getCurrentUserId } from '@/shared/hooks/use-user-id';
import { Plus, BookOpen, GraduationCap, FileText, Star } from 'lucide-react';
import { toast } from 'sonner';
import { PageTransition } from '@/components/ui/page-transition';

export default function MindPage() {
  const { data: books = [] } = useBooks();
  const { data: courses = [] } = useCourses();
  const { data: notes = [] } = useNotes();

  const createBook = useCreateBook();
  const createCourse = useCreateCourse();
  const createNote = useCreateNote();

  const [activeTab, setActiveTab] = useState<'books' | 'courses' | 'notes'>('books');
  const [bookDialogOpen, setBookDialogOpen] = useState(false);
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);

  const readingBooks = books.filter((b) => b.status === 'reading');
  const inProgressCourses = courses.filter((c) => c.status === 'in_progress');
  const favoriteNotes = notes.filter((n) => n.is_favorite);

  const handleCreateBook = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const userId = getCurrentUserId();

    createBook.mutate(
      {
        title: formData.get('title') as string,
        author: (formData.get('author') as string) || undefined,
        status: formData.get('status') as Book['status'],
        pages_total: formData.get('pages_total') ? Number(formData.get('pages_total')) : undefined,
        pages_read: 0,
        user_id: userId,
      },
      {
        onSuccess: () => {
          toast.success('Книга добавлена');
          setBookDialogOpen(false);
        },
        onError: () => toast.error('Ошибка'),
      }
    );
  };

  const handleCreateCourse = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const userId = getCurrentUserId();

    createCourse.mutate(
      {
        title: formData.get('title') as string,
        provider: (formData.get('provider') as string) || undefined,
        url: (formData.get('url') as string) || undefined,
        status: 'enrolled',
        progress: 0,
        user_id: userId,
      },
      {
        onSuccess: () => {
          toast.success('Курс добавлен');
          setCourseDialogOpen(false);
        },
        onError: () => toast.error('Ошибка'),
      }
    );
  };

  const handleCreateNote = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const userId = getCurrentUserId();

    createNote.mutate(
      {
        title: formData.get('title') as string,
        content: formData.get('content') as string,
        tags: [],
        is_favorite: false,
        user_id: userId,
      },
      {
        onSuccess: () => {
          toast.success('Заметка создана');
          setNoteDialogOpen(false);
        },
        onError: () => toast.error('Ошибка'),
      }
    );
  };

  return (
    <PageTransition>
      <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-wrap gap-2 justify-end">
        <Dialog open={bookDialogOpen} onOpenChange={setBookDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" style={{ height: '32px' }}>
              <Plus className="h-4 w-4 mr-2" />
              <span>Книгу</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreateBook}>
              <DialogHeader>
                <DialogTitle>Новая книга</DialogTitle>
                <DialogDescription>Добавьте книгу для отслеживания</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Название</Label>
                  <Input name="title" required />
                </div>
                <div className="grid gap-2">
                  <Label>Автор</Label>
                  <Input name="author" />
                </div>
                <div className="grid gap-2">
                  <Label>Статус</Label>
                  <select
                    name="status"
                    defaultValue="want_to_read"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Выберите статус</option>
                    <option value="want_to_read">Хочу прочитать</option>
                    <option value="reading">Читаю</option>
                    <option value="completed">Прочитано</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label>Всего страниц</Label>
                  <Input name="pages_total" type="number" />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setBookDialogOpen(false)}
                >
                  Отмена
                </Button>
                <Button type="submit">Добавить</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={courseDialogOpen} onOpenChange={setCourseDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" style={{ height: '32px' }}>
              <Plus className="h-4 w-4 mr-2" />
              <span>Курс</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreateCourse}>
              <DialogHeader>
                <DialogTitle>Новый курс</DialogTitle>
                <DialogDescription>Добавьте курс для обучения</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Название</Label>
                  <Input name="title" required />
                </div>
                <div className="grid gap-2">
                  <Label>Платформа</Label>
                  <Input name="provider" placeholder="Coursera, Udemy, etc." />
                </div>
                <div className="grid gap-2">
                  <Label>URL</Label>
                  <Input name="url" type="url" />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCourseDialogOpen(false)}
                >
                  Отмена
                </Button>
                <Button type="submit">Добавить</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" style={{ height: '32px' }}>
              <Plus className="h-4 w-4 mr-2" />
              <span>Заметку</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreateNote}>
              <DialogHeader>
                <DialogTitle>Новая заметка</DialogTitle>
                <DialogDescription>Создайте заметку</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Заголовок</Label>
                  <Input name="title" required />
                </div>
                <div className="grid gap-2">
                  <Label>Содержание</Label>
                  <textarea
                    name="content"
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setNoteDialogOpen(false)}
                >
                  Отмена
                </Button>
                <Button type="submit">Создать</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Читаю сейчас</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{readingBooks.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">В процессе</CardTitle>
            <GraduationCap className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressCourses.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Избранное</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{favoriteNotes.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v)}>
        <TabsList className="grid grid-cols-3 gap-2">
          <TabsTrigger value="books">
            <BookOpen className="h-4 w-4 mr-2" />
            Книги
          </TabsTrigger>
          <TabsTrigger value="courses">
            <GraduationCap className="h-4 w-4 mr-2" />
            Курсы
          </TabsTrigger>
          <TabsTrigger value="notes">
            <FileText className="h-4 w-4 mr-2" />
            Заметки
          </TabsTrigger>
        </TabsList>

        <TabsContent value="books" className="space-y-4 mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            {books.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="py-12 text-center text-muted-foreground">
                  Нет книг
                </CardContent>
              </Card>
            ) : (
              books.map((book) => (
                <Card key={book.id}>
                  <CardHeader>
                    <CardTitle>{book.title}</CardTitle>
                    {book.author && <CardDescription>{book.author}</CardDescription>}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge variant={book.status === 'completed' ? 'default' : 'secondary'}>
                        {book.status === 'reading'
                          ? 'Читаю'
                          : book.status === 'completed'
                            ? 'Прочитано'
                            : 'Хочу прочитать'}
                      </Badge>
                      {book.pages_total && (
                        <span className="text-sm text-muted-foreground">
                          {book.pages_read || 0}/{book.pages_total} стр.
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="courses" className="space-y-4 mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            {courses.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="py-12 text-center text-muted-foreground">
                  Нет курсов
                </CardContent>
              </Card>
            ) : (
              courses.map((course) => (
                <Card key={course.id}>
                  <CardHeader>
                    <CardTitle>{course.title}</CardTitle>
                    {course.provider && <CardDescription>{course.provider}</CardDescription>}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge variant={course.status === 'completed' ? 'default' : 'secondary'}>
                        {course.status === 'in_progress'
                          ? 'В процессе'
                          : course.status === 'completed'
                            ? 'Завершён'
                            : 'Записан'}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{course.progress}%</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="notes" className="space-y-4 mt-4">
          <div className="grid gap-4 md:grid-cols-3">
            {notes.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="py-12 text-center text-muted-foreground">
                  Нет заметок
                </CardContent>
              </Card>
            ) : (
              notes.map((note) => (
                <Card key={note.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{note.title}</CardTitle>
                      {note.is_favorite && (
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">{note.content}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
    </PageTransition>
  );
}

type Book = import('@/modules/mind/entities').Book;
