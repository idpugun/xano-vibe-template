import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { BackToLanding } from '@/components/BackToLanding';
import { Link } from 'react-router-dom';
import { predictionNotesService } from '@/lib/xano';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Calendar, FileText, Database, Menu, X, Settings, History } from 'lucide-react';
import toast from 'react-hot-toast';

interface PredictionNote {
  id: number;
  created_at: string;
  user_id: number;
  note: string;
}

export const HistoryPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [notes, setNotes] = useState<PredictionNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setIsLoading(true);
      const data = await predictionNotesService.getPredictionNotes();
      setNotes(data);
    } catch (error: unknown) {
      console.error('Failed to fetch prediction notes:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load prediction notes';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    if (!confirm('Are you sure you want to delete this prediction note? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingIds(prev => new Set(prev).add(noteId));
      await predictionNotesService.deletePredictionNote(noteId);
      setNotes(prev => prev.filter(note => note.id !== noteId));
      toast.success('Prediction note deleted successfully');
    } catch (error: unknown) {
      console.error('Failed to delete prediction note:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete prediction note';
      toast.error(errorMessage);
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(noteId);
        return newSet;
      });
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b backdrop-blur-sm bg-background/80 sticky top-0 z-[9999]">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Logo/Brand */}
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-primary to-primary/70 p-2 rounded-xl shadow-sm">
                  <Database className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold">Xano Boilerplate</h1>
                  <p className="text-xs text-muted-foreground">by Natt</p>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center space-x-4">
                <BackToLanding />
                <ThemeToggle />
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="h-9 w-9 p-0"
                  >
                    {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-6 py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading prediction notes...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b backdrop-blur-sm bg-background/80 sticky top-0 z-[9999]">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo/Brand */}
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-primary to-primary/70 p-2 rounded-xl shadow-sm">
                <Database className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Xano Boilerplate</h1>
                <p className="text-xs text-muted-foreground">by Natt</p>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center space-x-4">
              <BackToLanding />
              <ThemeToggle />
              
              {/* Hamburger Menu */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="h-9 w-9 p-0"
                >
                  {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                </Button>

                {/* Dropdown Menu */}
                {menuOpen && (
                  <div className="absolute right-0 top-12 w-64 bg-background border rounded-lg shadow-lg py-2 z-[9998]">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b">
                      <div className="flex items-center space-x-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <History className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{user?.name || 'User'}</p>
                          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <Link
                        to="/dashboard"
                        className="w-full text-left px-4 py-2 text-sm hover:bg-secondary/50 flex items-center space-x-2"
                        onClick={() => setMenuOpen(false)}
                      >
                        <Database className="h-4 w-4" />
                        <span>แดชบอร์ด</span>
                      </Link>
                      <Link
                        to="/settings"
                        className="w-full text-left px-4 py-2 text-sm hover:bg-secondary/50 flex items-center space-x-2"
                        onClick={() => setMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4" />
                        <span>การตั้งค่า</span>
                      </Link>
                      <button
                        type="button"
                        className="w-full text-left px-4 py-2 text-sm hover:bg-secondary/50 flex items-center space-x-2 text-red-600 dark:text-red-400"
                        onClick={() => {
                          logout();
                          setMenuOpen(false);
                        }}
                      >
                        <History className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Prediction History
          </h1>
          <p className="text-muted-foreground">
            View and manage your prediction notes
          </p>
        </div>

        {/* Notes List */}
        {notes.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              No prediction notes found
            </h3>
            <p className="text-muted-foreground">
              Your prediction notes will appear here once you create them.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {notes.map((note) => (
              <Card 
                key={note.id} 
                className="hover:shadow-lg transition-all duration-300"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {formatDate(note.created_at)}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteNote(note.id)}
                      disabled={deletingIds.has(note.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 p-2 h-8 w-8"
                    >
                      {deletingIds.has(note.id) ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-destructive" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {note.note}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Refresh Button */}
        <div className="mt-8 text-center">
          <Button
            onClick={fetchNotes}
            disabled={isLoading}
            className="px-6 py-2"
          >
            {isLoading ? 'Refreshing...' : 'Refresh Notes'}
          </Button>
        </div>
      </main>

      {/* Click outside to close menu */}
      {menuOpen && (
        <div 
          className="fixed inset-0 z-[9997]" 
          onClick={() => setMenuOpen(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setMenuOpen(false);
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Close menu"
        />
      )}
    </div>
  );
};
