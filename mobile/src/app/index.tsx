import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  View,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemedText } from '@/components/themed-text';
import { supabase } from '@/lib/supabase';
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
          status_verifikasi: 'verified',
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

      // Tambahkan data fallback Alumni Terverifikasi utama (Ahmad Ali & Ahmad Baidlowi)
      const verifiedList = [
        {
          id: 'ver-ahmad-ali',
          nama_lengkap: 'Ahmad Ali',
          nomor_id_unik: '3.35.1518.00003',
          nomor_hp: '081299993333',
          status_verifikasi: 'verified',
          angkatan: 2018,
          alamat_domisili: 'Pasuruan Jawa Timur',
        },
        {
          id: 'ver-ahmad-baidlowi',
          nama_lengkap: 'Ahmad Baidlowi',
          nomor_id_unik: '3.35.1518.00001',
          nomor_hp: '081299991111',
          status_verifikasi: 'verified',
          angkatan: 2018,
          alamat_domisili: 'Pasuruan Jawa Timur',
        },
        ...cloudVerified,
      ];

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
      const verifiedMatch = verifiedList.find((a) => {
        const niaClean = (a.nomor_id_unik || '').replace(/\D/g, '');
        const phoneClean = (a.nomor_hp || '').replace(/\D/g, '');

        const matchNiaExact = a.nomor_id_unik && a.nomor_id_unik.trim() === cleanId;
        const matchNiaDigits = cleanDigits.length >= 3 && niaClean.includes(cleanDigits);
        const matchPhone = cleanDigits.length >= 4 && phoneClean.includes(cleanDigits);
        const matchName = checkNameMatch(a.nama_lengkap);

        return matchNiaExact || matchNiaDigits || matchPhone || (matchName && (cleanDigits.length >= 2 || cleanId.length >= 2));
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
      source={require('@/assets/images/background.jpg')}
      style={styles.backgroundImage}
    >
      <View style={styles.darkOverlay}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
          >
            <View style={styles.content}>
              {/* Header Logo & Judul */}
              <View style={styles.header}>
                <Image
                  source={require('@/assets/images/icon.png')}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
                <ThemedText type="title" style={styles.title}>
                  Al-Hasaniyyah
                </ThemedText>
                <ThemedText style={styles.subtitle}>
                  Portal Resmi Alumni Pondok Pesantren Dalwa
                </ThemedText>
              </View>

              {/* Kartu Form Login Glassmorphism */}
              <View style={styles.card}>
                <ThemedText style={styles.welcomeText}>Ahlan Wasahlan</ThemedText>
                <ThemedText style={styles.instructionText}>
                  Silakan masuk menggunakan Nama Alumni & Nomor Induk Antum.
                </ThemedText>

                <View style={styles.formContainer}>
                  {/* Field 1: Nama Alumni */}
                  <View style={styles.inputWrapper}>
                    <ThemedText style={styles.label}>Nama Alumni</ThemedText>
                    <TextInput
                      style={styles.input}
                      placeholder="Masukkan nama lengkap alumni"
                      placeholderTextColor="#94A3B8"
                      value={nama}
                      onChangeText={setNama}
                      autoCapitalize="words"
                    />
                  </View>

                  {/* Field 2: Nomor Induk Anggota (NIA) */}
                  <View style={styles.inputWrapper}>
                    <ThemedText style={styles.label}>Nomor Induk Anggota (NIA) / No. WA</ThemedText>
                    <TextInput
                      style={styles.input}
                      placeholder="Contoh: 3.35.1518.00003 atau 081299993333"
                      placeholderTextColor="#94A3B8"
                      value={idUnik}
                      onChangeText={setIdUnik}
                      autoCapitalize="none"
                    />
                  </View>

                  {/* Tombol Masuk Gold */}
                  <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleLogin}
                    disabled={loading}
                  >
                    <ThemedText style={styles.buttonText}>
                      {loading ? 'Memverifikasi...' : 'Masuk'}
                    </ThemedText>
                  </TouchableOpacity>

                  {/* Link ke Pendaftaran */}
                  <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 16 }}>
                    <ThemedText style={{ color: '#64748B', fontSize: 14 }}>
                      Belum terdaftar?{' '}
                    </ThemedText>
                    <TouchableOpacity onPress={() => router.push('/register' as any)}>
                      <ThemedText style={{ color: '#D97706', fontWeight: 'bold', fontSize: 14 }}>
                        Daftar Sekarang
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  darkOverlay: {
    flex: 1,
    backgroundColor: 'rgba(6, 78, 59, 0.75)', // Emerald 900 transparan agar hijau gelap elegan
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoImage: {
    width: 80,
    height: 80,
    marginBottom: 16,
    borderRadius: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    textAlign: 'center',
    color: '#D1FAE5', // Emerald 100
    fontSize: 14,
    lineHeight: 22,
    paddingHorizontal: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)', // Putih transparan Glassmorphism
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A', // Slate 900
    marginBottom: 6,
    textAlign: 'center',
  },
  instructionText: {
    fontSize: 13,
    color: '#64748B', // Slate 500
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 18,
  },
  formContainer: {
    gap: 18,
  },
  inputWrapper: {
    gap: 6,
  },
  label: {
    fontWeight: '600',
    color: '#334155', // Slate 700
    fontSize: 13,
  },
  input: {
    backgroundColor: '#F8FAFC', // Slate 50
    borderColor: '#E2E8F0', // Slate 200
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0F172A',
  },
  button: {
    backgroundColor: '#D97706', // Amber 600 (Gold)
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#FCD34D',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
});
