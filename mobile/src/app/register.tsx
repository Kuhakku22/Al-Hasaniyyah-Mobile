import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, ImageBackground, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';

export default function RegisterScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState({
    nama: '',
    angkatan: '',
    domisili: '',
    phone: '',
  });

  const handleRegister = () => {
    // Basic validation
    if (!formData.nama || !formData.angkatan || !formData.domisili || !formData.phone) {
      alert('Mohon lengkapi semua data pendaftaran.');
      return;
    }

    setLoading(true);
    // Simulasi proses API
    setTimeout(() => {
      setLoading(false);
      setIsSuccess(true);
    }, 2000);
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
            <ScrollView contentContainerStyle={styles.scrollContent}>
              
              {!isSuccess ? (
                <View style={styles.card}>
                  <ThemedText style={styles.welcomeText}>Bergabung Bersama Kami</ThemedText>
                  <ThemedText style={styles.instructionText}>
                    Silakan isi formulir di bawah ini dengan data yang valid untuk memudahkan verifikasi pengurus.
                  </ThemedText>

                  <View style={styles.formContainer}>
                    <View style={styles.inputWrapper}>
                      <Text style={styles.label}>Nama Lengkap (Sesuai KTP)</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Contoh: Ahmad Fadillah"
                        placeholderTextColor="#94A3B8"
                        value={formData.nama}
                        onChangeText={(t) => setFormData({...formData, nama: t})}
                      />
                    </View>

                    <View style={styles.inputWrapper}>
                      <Text style={styles.label}>Tahun Lulus (Angkatan)</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Contoh: 2018"
                        placeholderTextColor="#94A3B8"
                        keyboardType="numeric"
                        maxLength={4}
                        value={formData.angkatan}
                        onChangeText={(t) => setFormData({...formData, angkatan: t})}
                      />
                    </View>

                    <View style={styles.inputWrapper}>
                      <Text style={styles.label}>Domisili / Wilayah Saat Ini</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Contoh: Jakarta Selatan"
                        placeholderTextColor="#94A3B8"
                        value={formData.domisili}
                        onChangeText={(t) => setFormData({...formData, domisili: t})}
                      />
                    </View>

                    <View style={styles.inputWrapper}>
                      <Text style={styles.label}>Nomor WhatsApp Aktif</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Contoh: 081234567890"
                        placeholderTextColor="#94A3B8"
                        keyboardType="phone-pad"
                        value={formData.phone}
                        onChangeText={(t) => setFormData({...formData, phone: t})}
                      />
                    </View>

                    <TouchableOpacity 
                      className={`bg-gold py-4 rounded-xl items-center shadow-md ${loading ? 'opacity-70' : 'active:opacity-80'}`}
                      style={{ marginTop: 24 }}
                      onPress={handleRegister}
                      disabled={loading}
                    >
                      <View className="flex-row items-center justify-center">
                        {loading && <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />}
                        <ThemedText style={styles.buttonText}>
                          {loading ? 'Mengirim Data...' : 'Kirim Pendaftaran'}
                        </ThemedText>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={[styles.card, { alignItems: 'center', paddingVertical: 40 }]}>
                  <View className="w-20 h-20 bg-emerald-500/20 rounded-full items-center justify-center mb-6">
                    <Ionicons name="checkmark-circle" size={50} color="#10b981" />
                  </View>
                  <Text className="font-bold text-2xl text-slate-800 mb-2 text-center">Alhamdulillah!</Text>
                  <Text className="text-slate-500 text-center mb-8 leading-6">
                    Pendaftaran Anda berhasil diajukan.{'\n'}Mohon menunggu verifikasi dari pengurus untuk mendapatkan Nomor Induk Anggota (NIA) yang akan dikirim via WhatsApp.
                  </Text>
                  
                  <TouchableOpacity 
                    className="w-full bg-emerald-600 p-4 rounded-xl items-center"
                    onPress={() => router.replace('/')}
                  >
                    <Text className="text-white font-bold">Kembali ke Halaman Login</Text>
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
});
