
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { useCollection, useFirestore, useUser, deleteDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import type { CustomCategory } from '@/lib/types';
import { collection, doc } from 'firebase/firestore';
import { CategoryForm } from './category-form';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from './ui/scroll-area';

interface ManageCategoriesDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function ManageCategoriesDialog({ isOpen, setIsOpen }: ManageCategoriesDialogProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const categoriesRef = useMemoFirebase(() => user ? collection(firestore, 'users', user.uid, 'custom_categories') : null, [firestore, user]);
  const { data: categories, isLoading } = useCollection<CustomCategory>(categoriesRef);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CustomCategory | null>(null);

  const handleAddNew = () => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  const handleEdit = (category: CustomCategory) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleDelete = (categoryId: string) => {
    if (!user) return;
    if (window.confirm('Tem certeza que deseja excluir esta categoria?')) {
      const categoryRef = doc(firestore, 'users', user.uid, 'custom_categories', categoryId);
      deleteDocumentNonBlocking(categoryRef);
      toast({ title: 'Categoria excluída!' });
    }
  };

  const handleClose = () => {
    setIsFormOpen(false);
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Gerenciar Categorias</DialogTitle>
          <DialogDescription>
            Crie, edite ou remova suas categorias personalizadas.
          </DialogDescription>
        </DialogHeader>

        {isFormOpen ? (
          <CategoryForm
            categoryToEdit={editingCategory}
            onSave={() => setIsFormOpen(false)}
          />
        ) : (
          <>
            <Button onClick={handleAddNew} className="w-full">
              <Plus className="mr-2 h-4 w-4" /> Adicionar Nova Categoria
            </Button>
            <ScrollArea className="h-64 mt-4">
              <div className="space-y-2 pr-4">
                {isLoading && <Loader2 className="mx-auto my-4 h-6 w-6 animate-spin" />}
                {!isLoading && categories?.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground py-4">
                    Nenhuma categoria personalizada encontrada.
                  </p>
                )}
                {categories?.map(cat => (
                  <div key={cat.id} className="flex items-center justify-between p-2 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <span className="text-xl" style={{ color: cat.color }}>{cat.icon}</span>
                      <span className="font-medium">{cat.name}</span>
                    </div>
                    <div className='flex items-center'>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(cat)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(cat.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
