'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { io } from 'socket.io-client';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImportPreviewTable } from '@/components/cost/ImportPreviewTable';
import { authenticatedFetchFormData } from '@/lib/api';

type WizardStep = 'upload' | 'preview' | 'validate' | 'commit' | 'complete';

export function ImportTariffWizard() {
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<WizardStep>('upload');
  const [progress, setProgress] = useState(0);
  const [previewData, setPreviewData] = useState<any>({ blp: [], blnp: [] });
  const [tariffVersion, setTariffVersion] = useState({
    name: '',
    effectiveDate: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const { toast } = useToast();

  // Socket.io setup for progress updates
  const setupSocket = useCallback(() => {
    const socket = io();
    socket.on('import-progress', (data: { progress: number }) => {
      setProgress(data.progress);
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  // File upload handler
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    if (file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      toast({
        title: 'Format file tidak valid',
        description: 'Harap unggah file Excel (.xlsx)',
        variant: 'destructive',
      });
      return;
    }
    
    setFile(file);
    handleFilePreview(file);
  }, [toast]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    maxFiles: 1,
  });

  // Preview file contents
  const handleFilePreview = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await authenticatedFetchFormData('/api/import/tariff/preview', formData);
      const data = await response.json();
      setPreviewData(data);
      setStep('preview');
    } catch (error: any) {
      toast({
        title: 'Error saat preview',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // Validate data
  const handleValidate = () => {
    // Validasi header dan data
    if (previewData.blp.length === 0 || previewData.blnp.length === 0) {
      toast({
        title: 'Data tidak valid',
        description: 'File harus berisi sheet BLNP dan BLP dengan format yang benar',
        variant: 'destructive',
      });
      return;
    }
    
    setStep('validate');
  };

  // Import data to database
  const handleImport = async () => {
    if (!file || !tariffVersion.name) return;
    
    try {
      setStep('commit');
      setProgress(0);
      
      // Setup socket for progress updates
      const cleanup = setupSocket();
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', tariffVersion.name);
      formData.append('effectiveDate', tariffVersion.effectiveDate);
      formData.append('notes', tariffVersion.notes || '');
      
      const response = await authenticatedFetchFormData('/api/import/tariff', formData);
      const result = await response.json();
      
      // Cleanup socket connection
      cleanup();
      
      setStep('complete');
      toast({
        title: 'Import berhasil',
        description: `Berhasil mengimpor ${result.blnpCount || 0} data BLNP dan ${result.blpCount || 0} data BLP`,
      });
    } catch (error: any) {
      toast({
        title: 'Error saat import',
        description: error.message || 'Terjadi kesalahan saat import',
        variant: 'destructive',
      });
      setStep('preview');
    }
  };

  // Reset wizard
  const handleReset = () => {
    setFile(null);
    setStep('upload');
    setProgress(0);
    setPreviewData({ blp: [], blnp: [] });
    setTariffVersion({
      name: '',
      effectiveDate: new Date().toISOString().split('T')[0],
      notes: '',
    });
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Import Tarif</CardTitle>
      </CardHeader>
      <CardContent>
        {step === 'upload' && (
          <div 
            {...getRootProps()} 
            className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center cursor-pointer hover:bg-gray-50"
          >
            <input {...getInputProps()} />
            <p>Drag & drop file Excel Biaya_Langsung.xlsx di sini, atau klik untuk memilih file</p>
            <p className="text-sm text-gray-500 mt-2">File harus berisi sheet BLNP dan BLP</p>
          </div>
        )}

        {step === 'preview' && (
          <div>
            <Tabs defaultValue="blp">
              <TabsList>
                <TabsTrigger value="blp">BLP (Biaya Langsung Personel)</TabsTrigger>
                <TabsTrigger value="blnp">BLNP (Biaya Langsung Non Personel)</TabsTrigger>
              </TabsList>
              <TabsContent value="blp">
                <ImportPreviewTable 
                  data={previewData.blp} 
                  headers={['No', 'Spesifikasi', 'Referensi Harga', 'Harga Satuan Bulanan (man months)', 'Harga Satuan Harian (man days)']} 
                />
              </TabsContent>
              <TabsContent value="blnp">
                <ImportPreviewTable 
                  data={previewData.blnp} 
                  headers={['Uraian', 'Referensi', 'KHS 2022', 'Keterangan']} 
                />
              </TabsContent>
            </Tabs>
            <div className="mt-4">
              <Button onClick={handleValidate}>Validasi Data</Button>
            </div>
          </div>
        )}

        {step === 'validate' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nama Versi Tarif</Label>
              <Input 
                id="name" 
                value={tariffVersion.name} 
                onChange={(e) => setTariffVersion({...tariffVersion, name: e.target.value})}
                placeholder="Contoh: Tarif 2024 Q1"
                required
              />
            </div>
            <div>
              <Label htmlFor="effectiveDate">Tanggal Efektif</Label>
              <Input 
                id="effectiveDate" 
                type="date" 
                value={tariffVersion.effectiveDate} 
                onChange={(e) => setTariffVersion({...tariffVersion, effectiveDate: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="notes">Catatan</Label>
              <Textarea 
                id="notes" 
                value={tariffVersion.notes} 
                onChange={(e) => setTariffVersion({...tariffVersion, notes: e.target.value})}
                placeholder="Catatan tambahan (opsional)"
              />
            </div>
          </div>
        )}

        {step === 'commit' && (
          <div className="space-y-4">
            <p>Mengimpor data ke database...</p>
            <Progress value={progress} />
            <p className="text-sm text-gray-500">{progress}% selesai</p>
          </div>
        )}

        {step === 'complete' && (
          <div className="text-center">
            <div className="text-green-500 text-5xl mb-4">✓</div>
            <h3 className="text-xl font-bold">Import Berhasil</h3>
            <p className="mt-2">Data tarif berhasil diimpor ke database</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {step !== 'upload' && step !== 'commit' && (
          <Button variant="outline" onClick={() => setStep(step === 'preview' ? 'upload' : step === 'validate' ? 'preview' : 'validate')}>
            Kembali
          </Button>
        )}
        {step === 'upload' && <div />}
        
        {step === 'validate' && (
          <Button onClick={handleImport} disabled={!tariffVersion.name || !tariffVersion.effectiveDate}>
            Import ke Database
          </Button>
        )}
        
        {step === 'complete' && (
          <Button onClick={handleReset}>
            Import Baru
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}