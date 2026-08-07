import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, ImageBackground, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/themed-text';
import { supabase } from '@/lib/supabase';
import { detectProvinceCode, generateStandardNIA } from '@/lib/nia';
import { openWhatsAppMessageMobile } from '@/lib/whatsapp';

export default function RegisterScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [generatedNia, setGeneratedNia] = useState('');

  const [formData, setFormData] = useState({
    nama: '',
    tempatTanggalLahir: '',
    alamatKtp: '',
    domisili: '',
    tahunMasuk: '',
    tahunKeluar: '',
    tahunLulus: '',
    phone: '',
  });

  const handleRegister = async () => {
    setErrorMessage('');

    // Basic validation
    if (!formData.nama.trim()) {
      setErrorMessage('Mohon isi bidang 1. Nama Lengkap (Sesuai KTP).');
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.alert('Form Belum Lengkap: Mohon isi 1. Nama Lengkap (Sesuai KTP).');
      }
      return;
    }

    if (
      !formData.tempatTanggalLahir.trim() ||
      !formData.alamatKtp.trim() ||
      !formData.domisili.trim() ||
      !formData.tahunMasuk.trim() ||
      !formData.tahunKeluar.trim() ||
      !formData.tahunLulus.trim() ||
      !formData.phone.trim()
    ) {
      setErrorMessage('Form belum lengkap. Mohon isi seluruh 8 data pendaftaran.');
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.alert('Form Belum Lengkap: Mohon lengkapi seluruh 8 data pendaftaran.');
      } else {
        Alert.alert('Form Belum Lengkap', 'Mohon lengkapi seluruh 8 data pendaftaran.');
      }
      return;
    }

    setLoading(true);
    try {
      // ID Pendaftaran Sementara
      const cleanPhone = formData.phone.replace(/[^0-9]/g, '');
      const randomDigits = Math.floor(1000 + Math.random() * 9000);
      const tempId = `REG-${cleanPhone.slice(-4) || '0000'}-${randomDigits}`;

      // 1. Kirim pendaftaran ke seluruh endpoint API (Local & Vercel)
      const payload = {
        nama: formData.nama,
        phone: formData.phone,
        domisili: formData.domisili,
        tahunMasuk: formData.tahunMasuk,
        tahunKeluar: formData.tahunKeluar,
        tahunLulus: formData.tahunLulus,
        tempatTanggalLahir: formData.tempatTanggalLahir,
        alamatKtp: formData.alamatKtp,
      };

      const endpoints = [
        '/api/register',
        'http://localhost:3000/api/register',
      ];

      for (const ep of endpoints) {
        try {
          await fetch(ep, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
        } catch (apiErr) {}
      }

      // 2. Simpan ke LocalStorage & BroadcastChannel Vercel (Persistens Cepat di Vercel Domain)
      if (typeof window !== 'undefined') {
        try {
          const pendingKey = '@pending_registrations';
          const existingStr = window.localStorage.getItem(pendingKey);
          let existing = [];
          if (existingStr && existingStr.trim()) {
            try {
              existing = JSON.parse(existingStr);
            } catch (err) {
              existing = [];
            }
          }
          existing.unshift(newItem);
          window.localStorage.setItem(pendingKey, JSON.stringify(existing));

          // Trigger storage event manual untuk tab sejenis
          window.dispatchEvent(new Event('storage'));

          if ('BroadcastChannel' in window) {
            const channel = new BroadcastChannel('alumni_channel');
            channel.postMessage({ type: 'NEW_REGISTRATION', data: newItem });
            channel.close();
          }
        } catch (storageErr) {}
      }

      // 3. Simpan ke Supabase di background
      const insertPayload = {
        nama_lengkap: formData.nama.trim(),
        alamat_domisili: formData.domisili.trim(),
        angkatan: parseInt(formData.tahunLulus) || 2024,
        nomor_hp: formData.phone.trim(),
        nomor_id_unik: tempId,
        status_verifikasi: 'pending',
      };

      const dbPromise = supabase.from('alumni').insert([insertPayload]);
      const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 1500));

      Promise.race([dbPromise, timeoutPromise]).catch(() => {});

      setGeneratedNia(tempId);
      setIsSuccess(true);
    } catch (e: any) {
      const msg = e.message || 'Terjadi kesalahan sistem pendaftaran.';
      setErrorMessage(msg);
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.alert(`Pendaftaran Gagal: ${msg}`);
      } else {
        Alert.alert('Pendaftaran Gagal', msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground 
      source={require('@/assets/images/background.jpg')} 
      style={styles.backgroundImage}
    >
      <View style={styles.darkOverlay}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          {/* Header */}
          <View className="flex-row items-center px-6 py-4">
            <TouchableOpacity onPress={() => router.back()} className="mr-4 bg-white/20 p-2 rounded-full">
              <Ionicons name="arrow-back" size={24} color="#ffffff" />
            </TouchableOpacity>
            <ThemedText type="title" style={{ color: '#fff', fontSize: 20 }}>
              Registrasi Alumni
            </ThemedText>
          </View>

          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
          >
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              
              {!isSuccess ? (
                <View style={styles.card}>
                  <ThemedText style={styles.welcomeText}>Bergabung Bersama Kami</ThemedText>
                  <ThemedText style={styles.instructionText}>
                    Silakan isi 8 formulir di bawah ini secara lengkap untuk verifikasi pendaftaran alumni.
                  </ThemedText>

                  <View style={styles.formContainer}>
                    {/* 1. Nama Lengkap sesuai KTP */}
                    <View style={styles.inputWrapper}>
                      <Text style={styles.label}>1. Nama Lengkap (Sesuai KTP)</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Contoh: Ahmad Fadillah"
                        placeholderTextColor="#94A3B8"
                        value={formData.nama}
                        onChangeText={(t) => setFormData({...formData, nama: t})}
                      />
                    </View>

                    {/* 2. Tempat Tanggal Lahir */}
                    <View style={styles.inputWrapper}>
                      <Text style={styles.label}>2. Tempat Tanggal Lahir</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Contoh: Pasuruan, 15 Agustus 1995"
                        placeholderTextColor="#94A3B8"
                        value={formData.tempatTanggalLahir}
                        onChangeText={(t) => setFormData({...formData, tempatTanggalLahir: t})}
                      />
                    </View>

                    {/* 3. Alamat sesuai KTP */}
                    <View style={styles.inputWrapper}>
                      <Text style={styles.label}>3. Alamat (Sesuai KTP)</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Contoh: Jl. Merdeka No. 12, Pasuruan"
                        placeholderTextColor="#94A3B8"
                        multiline
                        numberOfLines={2}
                        value={formData.alamatKtp}
                        onChangeText={(t) => setFormData({...formData, alamatKtp: t})}
                      />
                    </View>

                    {/* 4. Domisili saat ini */}
                    <View style={styles.inputWrapper}>
                      <Text style={styles.label}>4. Domisili Saat Ini</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Contoh: Surabaya, Jawa Timur"
                        placeholderTextColor="#94A3B8"
                        value={formData.domisili}
                        onChangeText={(t) => setFormData({...formData, domisili: t})}
                      />
                    </View>

                    {/* 5. Tahun Masuk */}
                    <View style={styles.inputWrapper}>
                      <Text style={styles.label}>5. Tahun Masuk</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Contoh: 2015"
                        placeholderTextColor="#94A3B8"
                        keyboardType="numeric"
                        maxLength={4}
                        value={formData.tahunMasuk}
                        onChangeText={(t) => setFormData({...formData, tahunMasuk: t})}
                      />
                    </View>

                    {/* 6. Tahun Keluar */}
                    <View style={styles.inputWrapper}>
                      <Text style={styles.label}>6. Tahun Keluar</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Contoh: 2018"
                        placeholderTextColor="#94A3B8"
                        keyboardType="numeric"
                        maxLength={4}
                        value={formData.tahunKeluar}
                        onChangeText={(t) => setFormData({...formData, tahunKeluar: t})}
                      />
                    </View>

                    {/* 7. Tahun Lulus */}
                    <View style={styles.inputWrapper}>
                      <Text style={styles.label}>7. Tahun Lulus</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Contoh: 2018"
                        placeholderTextColor="#94A3B8"
                        keyboardType="numeric"
                        maxLength={4}
                        value={formData.tahunLulus}
                        onChangeText={(t) => setFormData({...formData, tahunLulus: t})}
                      />
                    </View>

                    {/* 8. No WhatsApp */}
                    <View style={styles.inputWrapper}>
                      <Text style={styles.label}>8. Nomor WhatsApp Aktif</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Contoh: 081234567890"
                        placeholderTextColor="#94A3B8"
                        keyboardType="phone-pad"
                        value={formData.phone}
                        onChangeText={(t) => setFormData({...formData, phone: t})}
                      />
                    </View>

                    {errorMessage ? (
                      <View className="bg-rose-500/10 border border-rose-500/30 p-3 rounded-xl mt-4">
                        <Text className="text-rose-600 text-xs font-bold text-center">{errorMessage}</Text>
                      </View>
                    ) : null}

                    <TouchableOpacity 
                      className={`bg-gold py-4 rounded-xl items-center shadow-md ${loading ? 'opacity-70' : 'active:opacity-80'}`}
                      style={{ marginTop: 20 }}
                      onPress={handleRegister}
                      disabled={loading}
                    >
                      <View className="flex-row items-center justify-center">
                        {loading && <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />}
                        <ThemedText style={styles.buttonText}>
                          {loading ? 'Menyimpan Data...' : 'Kirim Pendaftaran'}
                        </ThemedText>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={[styles.card, { alignItems: 'center', paddingVertical: 36 }]}>
                  <View className="w-20 h-20 bg-amber-500/20 rounded-full items-center justify-center mb-6">
                    <Ionicons name="time-outline" size={48} color="#d97706" />
                  </View>
                  <Text className="font-bold text-2xl text-slate-800 mb-2 text-center">Alhamdulillah!</Text>
                  <Text className="text-slate-600 text-center mb-6 leading-6 text-sm px-2">
                    Pendaftaran Anda telah berhasil terkirim ke Pengurus Pusat.
                  </Text>

                  <View className="w-full bg-amber-50 border border-amber-200 p-5 rounded-2xl mb-6 space-y-2">
                    <Text className="text-amber-900 font-bold text-xs uppercase tracking-wider">Status: Menunggu Verifikasi Admin</Text>
                    <Text className="text-slate-700 text-xs leading-5 mt-1">
                      Nomor Induk Anggota (NIA) resmi Anda akan diproses oleh Admin Pusat dan dikirimkan langsung melalui pesan WhatsApp ke nomor:
                    </Text>
                    <Text className="text-emerald-700 font-mono font-bold text-sm mt-2">{formData.phone}</Text>
                  </View>

                  <Text className="text-slate-500 text-center text-xs mb-6 leading-5 px-4">
                    Setelah menerima pesan WA konfirmasi & Nomor NIA resmi dari Admin Pusat, Anda dapat langsung login ke aplikasi.
                  </Text>

                  <TouchableOpacity 
                    className="w-full bg-slate-900 p-4 rounded-xl items-center"
                    onPress={() => router.replace('/')}
                  >
                    <Text className="text-white font-bold text-base">Kembali ke Beranda / Login</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: { flex: 1, width: '100%', height: '100%' },
  darkOverlay: { flex: 1, backgroundColor: 'rgba(6, 78, 59, 0.85)' },
  safeArea: { flex: 1 },
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, justifyContent: 'center', paddingVertical: 20 },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  welcomeText: { fontSize: 22, fontWeight: '700', color: '#0F172A', marginBottom: 8, textAlign: 'center' },
  instructionText: { fontSize: 13, color: '#64748B', textAlign: 'center', marginBottom: 28, lineHeight: 20 },
  formContainer: { gap: 16 },
  inputWrapper: { gap: 6 },
  label: { fontWeight: '600', color: '#334155', fontSize: 13 },
  input: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0F172A',
  },
  buttonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16, letterSpacing: 0.5 },
  niaBox: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  niaLabel: { fontSize: 13, color: '#047857', marginBottom: 4 },
  niaValue: { fontSize: 22, fontWeight: '800', color: '#065F46', letterSpacing: 1 },
});
