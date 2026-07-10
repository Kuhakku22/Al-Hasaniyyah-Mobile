import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, ImageBackground, KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { supabase } from '@/lib/supabase';

export default function LoginScreen() {
  const [idUnik, setIdUnik] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!idUnik) {
      Alert.alert('Error', 'Ahmad Ali 220102');
      return;
    }

    setLoading(true);
    try {
      // JALAN PINTAS UNTUK TESTING
      if (idUnik === '123456') {
        Alert.alert('Login Berhasil', 'Selamat datang di Mode Uji Coba!');
        router.replace('/(tabs)/home');
        return;
      }

      const { data, error } = await supabase
        .from('alumni')
        .select('*')
        .eq('nomor_id_unik', idUnik)
        .single();

      if (error || !data) {
        Alert.alert('Login Gagal', 'Nomor ID Unik tidak ditemukan.');
      } else {
        Alert.alert('Login Berhasil', `Selamat datang, ${data.nama_lengkap}!`);
        router.replace('/(tabs)/home');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground 
      // GANTI URL DI BAWAH INI DENGAN GAMBAR ANDA JIKA SUDAH DISIMPAN DI FOLDER LOKAL:
      // source={require('@/assets/images/background.jpg')}
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

              <View style={styles.card}>
                <ThemedText style={styles.welcomeText}>Ahlan Wasahlan</ThemedText>
                <ThemedText style={styles.instructionText}>
                  Silakan masuk menggunakan Nomor Induk Anggota Antum.
                </ThemedText>

                <View style={styles.formContainer}>
                  <View style={styles.inputWrapper}>
                    <ThemedText style={styles.label}>Nomor Induk Anggota</ThemedText>
                    <TextInput
                      style={styles.input}
                      placeholder="Contoh: 09445"
                      placeholderTextColor="#94A3B8"
                      value={idUnik}
                      onChangeText={setIdUnik}
                      autoCapitalize="none"
                      keyboardType="numeric"
                    />
                  </View>

                  <TouchableOpacity 
                    className={`bg-gold py-4 rounded-xl items-center shadow-md ${loading ? 'opacity-70' : 'active:opacity-80'}`}
                    style={{ marginTop: 24 }}
                    onPress={handleLogin}
                    disabled={loading}
                  >
                    <ThemedText style={styles.buttonText}>
                      {loading ? 'Memverifikasi...' : 'Masuk'}
                    </ThemedText>
                  </TouchableOpacity>

                  <View className="flex-row justify-center mt-4">
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
    backgroundColor: 'rgba(6, 78, 59, 0.75)', // Emerald 900 transparan agar hijau gelap
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
    marginBottom: 40,
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
    backgroundColor: 'rgba(255, 255, 255, 0.95)', // Putih sedikit transparan (Glassmorphism)
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
    marginBottom: 8,
    textAlign: 'center',
  },
  instructionText: {
    fontSize: 14,
    color: '#64748B', // Slate 500
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  formContainer: {
    gap: 24,
  },
  inputWrapper: {
    gap: 8,
  },
  label: {
    fontWeight: '600',
    color: '#334155', // Slate 700
    fontSize: 14,
  },
  input: {
    backgroundColor: '#F8FAFC', // Slate 50
    borderColor: '#E2E8F0', // Slate 200
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#0F172A',
  },
  button: {
    backgroundColor: '#D97706', // Amber 600 (Gold)
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: {
    backgroundColor: '#FCD34D', // Amber 300
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
