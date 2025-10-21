'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { authenticatedFetch } from '@/lib/api';

interface ProjectCategory {
  id: string;
  kategori: string;
}

export default function CreateEstimatePage() {
  const [categories, setCategories] = useState<ProjectCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [title, setTitle] = useState('');
  const [client, setClient] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await authenticatedFetch('/api/categories');
      const data = await response.json();
      console.log('Categories API response:', data);
      setCategories(data.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: 'Error',
        description: 'Gagal mengambil data kategori proyek',
        variant: 'destructive'
      });
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCategoryId || !title.trim()) {
      toast({
        title: 'Error',
        description: 'Harap lengkapi semua field yang wajib',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await authenticatedFetch('/api/cost/estimators', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: title,
          projectId: null, // No specific project selected
          projectName: selectedCategory?.kategori, // Use category as project name
          client: client.trim() || null, // Client name
          description,
          status: 'DRAFT',
          version: '1.0',
          markUpPct: 0,
          contingencyPct: 0,
          discountPct: 0,
          ppnPct: 11,
          escalationPct: 0,
          subtotal: 0,
          escalation: 0,
          overhead: 0,
          contingency: 0,
          discount: 0,
          dpp: 0,
          ppn: 0,
          grandTotal: 0
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: 'Berhasil',
          description: 'Estimasi berhasil dibuat'
        });

        // Redirect to estimate editor
        router.push(`/cost/estimates/${result.data.id}`);
      } else {
        // Handle validation errors specifically
        if (response.status === 422 && result.details) {
          const validationErrors = Object.values(result.details).map((error: any) => error._errors?.[0]).filter(Boolean);
          const errorMessage = validationErrors.length > 0 
            ? `Validation error: ${validationErrors.join(', ')}`
            : result.error || 'Gagal membuat estimasi';
          throw new Error(errorMessage);
        } else {
          throw new Error(result.error || 'Gagal membuat estimasi');
        }
      }
    } catch (error: any) {
      console.error('Error creating estimate:', error);
      toast({
        title: 'Error',
        description: error.message || 'Gagal membuat estimasi',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedCategory = categories.find(c => c.id === selectedCategoryId);

  if (isLoadingCategories) {
    return <div className="container mx-auto py-6">Memuat data kategori proyek...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Buat Estimasi Baru</h1>
          <p className="text-gray-600">Buat estimasi biaya untuk proyek yang dipilih</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informasi Estimasi</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="category">Kategori Proyek *</Label>
                <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori proyek" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div>
                          <div className="font-medium">{category.kategori}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedCategory && (
                  <p className="text-sm text-gray-500 mt-1">
                    Kategori: {selectedCategory.kategori}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="title">Nama Estimasi *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Estimasi Implementasi Sistem"
                  required
                />
              </div>

              <div>
                <Label htmlFor="client">Nama Pelanggan</Label>
                <Input
                  id="client"
                  value={client}
                  onChange={(e) => setClient(e.target.value)}
                  placeholder="Contoh: PT. ABC Company"
                />
              </div>

              <div>
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Deskripsi singkat tentang estimasi ini..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Membuat...' : 'Buat Estimasi'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}