"use client";

import React, { useState, useEffect } from "react";
import { PlusIcon, PencilIcon, CheckCircleIcon, CloseIcon, TrashBinIcon } from "@/icons";

interface LicenseFormData {
  id?: number;
  nama_aplikasi: string;
  bpo: string;
  jenis_lisensi: string;
  jumlah: number;
  harga_satuan: number;
  harga_total: number;
  periode_po: number;
  kontrak_layanan_bulan: number;
  start_layanan: string;
  akhir_layanan: string;
  metode: string;
  keterangan_akun: string;
  tanggal_aktivasi: string;
  tanggal_pembaharuan: string;
  status: string;
  selling_price: number;
  purchase_price_per_unit: number;
  total_purchase_price: number;
  total_selling_price: number;
}

interface LicenseFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: LicenseFormData) => Promise<void>;
  onDelete?: (id: number) => Promise<void>;
  editData?: LicenseFormData | null;
  loading?: boolean;
}

const LicenseForm: React.FC<LicenseFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  editData,
  loading = false
}) => {
  const [formData, setFormData] = useState<LicenseFormData>({
    nama_aplikasi: "",
    bpo: "",
    jenis_lisensi: "",
    jumlah: 0,
    harga_satuan: 0,
    harga_total: 0,
    periode_po: 0,
    kontrak_layanan_bulan: 0,
    start_layanan: "",
    akhir_layanan: "",
    metode: "",
    keterangan_akun: "",
    tanggal_aktivasi: "",
    tanggal_pembaharuan: "",
    status: "Active",
    selling_price: 0,
    purchase_price_per_unit: 0,
    total_purchase_price: 0,
    total_selling_price: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens/closes or editData changes
  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setFormData(editData);
      } else {
        setFormData({
          nama_aplikasi: "",
          bpo: "",
          jenis_lisensi: "",
          jumlah: 0,
          harga_satuan: 0,
          harga_total: 0,
          periode_po: 0,
          kontrak_layanan_bulan: 0,
          start_layanan: "",
          akhir_layanan: "",
          metode: "",
          keterangan_akun: "",
          tanggal_aktivasi: "",
          tanggal_pembaharuan: "",
          status: "Active",
          selling_price: 0,
          purchase_price_per_unit: 0,
          total_purchase_price: 0,
          total_selling_price: 0,
        });
      }
      setErrors({});
    }
  }, [isOpen, editData]);

  // Auto calculate totals when values change
  useEffect(() => {
    const jumlah = Number(formData.jumlah) || 0;
    const hargaSatuan = Number(formData.harga_satuan) || 0;
    const sellingPrice = Number(formData.selling_price) || 0;
    
    const hargaTotal = jumlah * hargaSatuan;
    const totalPurchasePrice = jumlah * hargaSatuan;
    const totalSellingPrice = jumlah * sellingPrice;
    
    setFormData(prev => ({ 
      ...prev, 
      harga_total: hargaTotal,
      total_purchase_price: totalPurchasePrice,
      total_selling_price: totalSellingPrice,
      purchase_price_per_unit: hargaSatuan
    }));
  }, [formData.jumlah, formData.harga_satuan, formData.selling_price]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nama_aplikasi.trim()) {
      newErrors.nama_aplikasi = 'Nama aplikasi wajib diisi';
    }

    if (!formData.bpo.trim()) {
      newErrors.bpo = 'BPO wajib diisi';
    }

    if (!formData.jenis_lisensi.trim()) {
      newErrors.jenis_lisensi = 'Jenis lisensi wajib diisi';
    }

    if (formData.jumlah <= 0) {
      newErrors.jumlah = 'Jumlah harus lebih dari 0';
    }

    if ((formData.harga_satuan || 0) <= 0) {
      newErrors.harga_satuan = 'Harga satuan harus lebih dari 0';
    }

    if (!formData.start_layanan) {
      newErrors.start_layanan = 'Tanggal mulai layanan wajib diisi';
    }

    if (!formData.akhir_layanan) {
      newErrors.akhir_layanan = 'Tanggal akhir layanan wajib diisi';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleDelete = async () => {
    if (!editData?.id || !onDelete) return;
    
    if (!confirm('Apakah Anda yakin ingin menghapus lisensi ini?')) {
      return;
    }

    try {
      await onDelete(editData.id);
      onClose();
    } catch (error) {
      console.error('Error deleting license:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {editData ? 'Edit' : 'Tambah'} Monitoring Lisensi
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            disabled={loading}
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* ID - Auto Generated */}
            {editData && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ID (Auto Generated)
                </label>
                <input
                  type="number"
                  value={formData.id || 0}
                  className="w-full px-3 py-2 border rounded-lg bg-gray-100 dark:bg-gray-600 dark:border-gray-600 dark:text-white border-gray-300"
                  disabled
                />
              </div>
            )}

            {/* Nama Aplikasi */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nama Aplikasi *
              </label>
              <input
                type="text"
                name="nama_aplikasi"
                value={formData.nama_aplikasi}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.nama_aplikasi ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
                placeholder="Contoh: Oracle Crystal Ball"
              />
              {errors.nama_aplikasi && <p className="text-red-500 text-xs mt-1">{errors.nama_aplikasi}</p>}
            </div>

            {/* BPO */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                BPO *
              </label>
              <input
                type="text"
                name="bpo"
                value={formData.bpo}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.bpo ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
                placeholder="Contoh: BPO001"
              />
              {errors.bpo && <p className="text-red-500 text-xs mt-1">{errors.bpo}</p>}
            </div>

            {/* Jenis Lisensi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Jenis Lisensi *
              </label>
              <select
                name="jenis_lisensi"
                value={formData.jenis_lisensi}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.jenis_lisensi ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
              >
                <option value="">Pilih Jenis</option>
                <option value="Perpetual License">Perpetual License</option>
                <option value="Perpetual License + ATS Yearly">Perpetual License + ATS Yearly</option>
                <option value="Subscription License">Subscription License</option>
                <option value="Trial License">Trial License</option>
                <option value="Educational License">Educational License</option>
              </select>
              {errors.jenis_lisensi && <p className="text-red-500 text-xs mt-1">{errors.jenis_lisensi}</p>}
            </div>

            {/* Jumlah */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Jumlah *
              </label>
              <input
                type="number"
                name="jumlah"
                value={formData.jumlah}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.jumlah ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
                min="1"
              />
              {errors.jumlah && <p className="text-red-500 text-xs mt-1">{errors.jumlah}</p>}
            </div>

            {/* Harga Satuan */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Harga Satuan *
              </label>
              <input
                type="number"
                name="harga_satuan"
                value={formData.harga_satuan || 0}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.harga_satuan ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
                min="0"
                step="0.01"
              />
              {errors.harga_satuan && <p className="text-red-500 text-xs mt-1">{errors.harga_satuan}</p>}
            </div>

            {/* Harga Total */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Harga Total
              </label>
              <input
                type="number"
                name="harga_total"
                value={formData.harga_total || 0}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white border-gray-300"
                disabled={loading}
                min="0"
                step="0.01"
              />
            </div>

            {/* Selling Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Selling Price
              </label>
              <input
                type="number"
                name="selling_price"
                value={formData.selling_price || 0}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white border-gray-300"
                disabled={loading}
                min="0"
                step="0.01"
              />
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                name="start_layanan"
                value={formData.start_layanan}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.start_layanan ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              {errors.start_layanan && <p className="text-red-500 text-xs mt-1">{errors.start_layanan}</p>}
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Date *
              </label>
              <input
                type="date"
                name="akhir_layanan"
                value={formData.akhir_layanan}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.akhir_layanan ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              {errors.akhir_layanan && <p className="text-red-500 text-xs mt-1">{errors.akhir_layanan}</p>}
            </div>

            {/* Metode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Metode
              </label>
              <input
                type="text"
                name="metode"
                value={formData.metode}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white border-gray-300"
                disabled={loading}
                placeholder="Contoh: Purchase Order"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white border-gray-300"
                disabled={loading}
              >
                <option value="Active">Active</option>
                <option value="Expired">Expired</option>
                <option value="Expiring Soon">Expiring Soon</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            {/* Keterangan Akun */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Keterangan Akun
              </label>
              <textarea
                name="keterangan_akun"
                value={formData.keterangan_akun}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white border-gray-300"
                disabled={loading}
                rows={3}
                placeholder="Tambahkan keterangan tambahan..."
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div>
              {editData && onDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
                  disabled={loading}
                >
                  <TrashBinIcon className="w-4 h-4" />
                  Hapus
                </button>
              )}
            </div>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                disabled={loading}
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-4 h-4" />
                    {editData ? 'Update' : 'Simpan'}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LicenseForm;
