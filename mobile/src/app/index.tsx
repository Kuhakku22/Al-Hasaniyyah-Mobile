import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, ImageBackground, KeyboardAvoidingView, Platform, StyleSheet, TextInput, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemedText } from '@/components/themed-text';
import { supabase } from '@/lib/supabase';
import { detectProvinceCode, generateStandardNIA } from '@/lib/nia';
import { getCloudVerifiedAlumni, getCloudPendingRegistrations } from '@/lib/cloudSync';

export default function LoginScreen() {
  const [nama, setNama] = useState('');
  const [idUnik, setIdUnik] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const cleanNama = nama.trim();
    const cleanId = idUnik.trim();

    if (!cleanNama || !cleanId) {
      Alert.alert('Error', 'Silakan isi Nama Alumni dan Nomor Induk Anggota (NIA) atau Nomor WA.');
      return;
    }

    setLoading(true);
    try {
      // 1. JALAN PINTAS UNTUK DEMO & TESTING INSTAN
      if (cleanId === '123456' || cleanId.toLowerCase() === 'admin') {
        const mockUser = {
          id: '00000000-0000-0000-0000-000000000000',
          nomor_id_unik: '3.35.1518.00001',
          nama_lengkap: cleanNama || 'Ahmad Baidlowi',
          nomor_hp: '081299991111',
          angkatan: 2018,
          alamat_domisili: 'Pasuruan Jawa Timur',
          status_verifikasi: 'verified'
        };
        await AsyncStorage.setItem('userToken', mockUser.id);
        await AsyncStorage.setItem('userProfile', JSON.stringify(mockUser));
        Alert.alert('Login Berhasil', `Selamat datang di Mode Uji Coba, ${mockUser.nama_lengkap}!`);
        router.replace('/(tabs)/home');
        return;
      }

      // 2. Ambil data Alumni Terverifikasi & Pending dari Cloud Sync Store 24/7
      const cloudVerified = await getCloudVerifiedAlumni();
      const cloudPending = await getCloudPendingRegistrations();

      const inputNameLower = cleanNama.toLowerCase();
      const cleanDigits = cleanId.replace(/\D/g, '');

      // Helper Pencocokan Nama Fleksibel
      const checkNameMatch = (dbName: string) => {
        const target = (dbName || '').toLowerCase().trim();
        if (!target || !inputNameLower) return false;
        if (target === inputNameLower || target.includes(inputNameLower) || inputNameLower.includes(target)) return true;
        const inputWords = inputNameLower.split(/\s+/).filter((w) => w.length >= 2);
        return inputWords.some((w) => target.includes(w));
      };

      // A. Cek di Alumni Terverifikasi (by NIA, No. WA, ID, atau Nama)
      const verifiedMatch = cloudVerified.find((a) => {
        const niaClean = (a.nomor_id_unik || '').replace(/\D/g, '');
        const phoneClean = (a.nomor_hp || '').replace(/\D/g, '');

        const matchNiaExact = a.nomor_id_unik && a.nomor_id_unik.trim() === cleanId;
        const matchNiaDigits = cleanDigits.length >= 4 && niaClean.includes(cleanDigits);
        const matchPhone = cleanDigits.length >= 4 && phoneClean.includes(cleanDigits);
        const matchName = checkNameMatch(a.nama_lengkap);

        return matchNiaExact || matchNiaDigits || matchPhone || (matchName && cleanDigits.length >= 3);
      });

      if (verifiedMatch) {
        if (!checkNameMatch(verifiedMatch.nama_lengkap)) {
          Alert.alert('Login Gagal', `Nama Alumni "${cleanNama}" dan NIA/No.WA "${cleanId}" tidak cocok.`);
          return;
        }

        await AsyncStorage.setItem('userToken', verifiedMatch.id || 'usr-' + Date.now());
        await AsyncStorage.setItem('userProfile', JSON.stringify(verifiedMatch));
        Alert.alert('Login Berhasil', `Selamat datang, ${verifiedMatch.nama_lengkap}!`);
        router.replace('/(tabs)/home');
        return;
      }

      // B. Cek di Alumni Pending (Pendaftaran sedang diproses Admin)
      const pendingMatch = cloudPending.find((a) => {
        const niaClean = (a.nomor_id_unik || '').replace(/\D/g, '');
        const phoneClean = (a.nomor_hp || '').replace(/\D/g, '');
        return (
          (a.nomor_id_unik && a.nomor_id_unik.trim() === cleanId) ||
          (cleanDigits.length >= 4 && niaClean.includes(cleanDigits)) ||
          (cleanDigits.length >= 4 && phoneClean.includes(cleanDigits)) ||
          checkNameMatch(a.nama_lengkap)
        );
      });

      if (pendingMatch) {
        Alert.alert(
          'Pendaftaran Masih Pending',
          `Akun atas nama ${pendingMatch.nama_lengkap} sudah terdaftar dan sedang menunggu verifikasi/persetujuan Admin di Portal Pusat.`
        );
        return;
      }

      // C. Fallback Database Supabase
      let dbData = null;
      try {
        const { data } = await supabase.from('alumni').select('*').eq('nomor_id_unik', cleanId).single();
        if (data) dbData = data;
      } catch (err) {}

      if (dbData) {
        if (!checkNameMatch(dbData.nama_lengkap)) {
          Alert.alert('Login Gagal', 'Nama Alumni dan Nomor Induk Anggota (NIA) tidak cocok.');
          return;
        }

        await AsyncStorage.setItem('userToken', dbData.id);
        await AsyncStorage.setItem('userProfile', JSON.stringify(dbData));
        Alert.alert('Login Berhasil', `Selamat datang, ${dbData.nama_lengkap}!`);
        router.replace('/(tabs)/home');
        return;
      }

      Alert.alert(
        'Akun Belum Ditemukan',
        `Data "${cleanNama}" dengan NIA/No.WA "${cleanId}" belum terdaftar atau belum disetujui Admin. Silakan mendaftar terlebih dahulu pada menu Pendaftaran.`
      );
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Terjadi kesalahan sistem pada login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('@/assets/images/react-logo.png')}
      style={styles.backgroundImage}
      imageStyle={{ opacity: 0.05 }}
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.cardContainer}>
            {/* Header Identity */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <ThemedText type="subtitle" style={styles.logoText}>
                  AH
                </ThemedText>
              </View>
              <ThemedText type="title" style={styles.title}>
                AL HASANIYYAH
              </ThemedText>
              <ThemedText style={styles.subtitle}>
                Aplikasi Alumni Dalwa Raci Pasuruan
              </ThemedText>
            </View>

            {/* Form Inputs */}
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>Nama Alumni (Lengkap / Panggilan)</ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="Contoh: Ahmad Baidlowi"
                  placeholderTextColor="#94a3b8"
                  value={nama}
                  onChangeText={setNama}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>Nomor NIA Baku / Nomor WA</ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="Contoh: 3.35.1518.00001 atau 081299991111"
                  placeholderTextColor="#94a3b8"
                  value={idUnik}
                  onChangeText={setIdUnik}
                  autoCapitalize="none"
                />
              </View>

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={loading}
              >
                <ThemedText style={styles.buttonText}>
                  {loading ? 'MEMERIKSA DATA...' : 'MASUK APLIKASI'}
                </ThemedText>
              </TouchableOpacity>
            </View>

            {/* Navigation Link to Register */}
            <View style={styles.footerLinkContainer}>
              <ThemedText style={styles.footerLinkText}>Belum terdaftar sebagai alumni?</ThemedText>
              <TouchableOpacity onPress={() => router.push('/register')}>
                <ThemedText style={styles.registerLink}>Daftar Akun Baru Di Sini</ThemedText>
              </TouchableOpacity>
            </View>

            {/* Quick Demo Test Help */}
            <View style={{ marginTop: 20, alignItems: 'center' }}>
              <ThemedText style={{ fontSize: 11, color: '#059669', fontWeight: 'bold' }}>
                💡 Untuk Uji Coba Instan: Masukkan NIA "123456"
              </ThemedText>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    backgroundColor: '#022c22', // Dark Emerald
  },
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  cardContainer: {
    backgroundColor: 'rgba(6, 78, 59, 0.85)', // Glassmorphism Emerald
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)', // Gold Border
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#064e3b',
    borderWidth: 2,
    borderColor: '#fbbf24',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoText: {
    color: '#fbbf24',
    fontWeight: 'bold',
    fontSize: 22,
  },
  title: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  subtitle: {
    color: '#6ee7b7',
    fontSize: 12,
    marginTop: 4,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    color: '#a7f3d0',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: 'rgba(2, 44, 34, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 14,
    padding: 14,
    color: '#ffffff',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#f59e0b', // Amber / Gold Accent
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#022c22',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1,
  },
  footerLinkContainer: {
    marginTop: 20,
    alignItems: 'center',
    gap: 4,
  },
  footerLinkText: {
    color: '#94a3b8',
    fontSize: 12,
  },
  registerLink: {
    color: '#fbbf24',
    fontSize: 13,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});
