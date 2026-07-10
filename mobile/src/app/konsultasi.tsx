import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function KonsultasiScreen() {
  const router = useRouter();
  
  const [suggestion, setSuggestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Simulasi data riwayat masukan
  const [history, setHistory] = useState([
    {
      id: 1,
      date: '10 Juli 2026',
      content: 'Mohon agar aplikasi ini kedepannya bisa menambahkan fitur notifikasi adzan sesuai wilayah.',
      status: 'Menunggu Tanggapan'
    },
    {
      id: 2,
      date: '5 Juni 2026',
      content: 'Bagaimana prosedur pergantian ketua Korda di wilayah Sumatera?',
      status: 'Ditanggapi',
      reply: 'Prosedur pergantian Korda telah diatur dalam AD/ART Bab IV. Silakan cek menu AD/ART di beranda.'
    }
  ]);

  const handleSubmit = () => {
    if (!suggestion.trim()) return;

    setIsSubmitting(true);
    // Simulasi pengiriman data ke server
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      
      // Tambahkan ke riwayat lokal
      const newEntry = {
        id: Date.now(),
        date: 'Hari ini',
        content: suggestion,
        status: 'Menunggu Tanggapan'
      };
      setHistory([newEntry, ...history]);
      
      // Reset input setelah 3 detik
      setTimeout(() => {
        setIsSuccess(false);
        setSuggestion('');
      }, 3000);
    }, 1500);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-900" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center p-4 border-b border-slate-800">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#94a3b8" />
        </TouchableOpacity>
        <Text className="text-white font-bold text-lg">Konsultasi & Saran</Text>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={{ flex: 1 }}
      >
        <ScrollView className="flex-1 p-4">
          
          {/* Info Banner */}
          <View className="bg-indigo-900/30 p-4 rounded-xl border border-indigo-500/30 mb-6 flex-row items-start">
            <Ionicons name="information-circle" size={20} color="#818cf8" style={{ marginTop: 2, marginRight: 8 }} />
            <Text className="text-indigo-200 text-xs flex-1 leading-5">
              Fitur ini didedikasikan untuk menampung kritik, saran, dan masukan membangun dari seluruh alumni. Setiap masukan akan ditinjau dan ditanggapi langsung oleh Admin Pusat.
            </Text>
          </View>

          {/* Form Input */}
          <Text className="text-white font-bold mb-3">Tulis Masukan Anda</Text>
          
          <View className="bg-slate-950 rounded-2xl border border-slate-700 p-2 mb-4">
            <TextInput
              className="text-white p-3 h-32"
              placeholder="Tulis saran, masukan, atau keluhan Anda di sini..."
              placeholderTextColor="#64748b"
              multiline
              textAlignVertical="top"
              value={suggestion}
              onChangeText={setSuggestion}
            />
          </View>

          {/* Tombol Kirim */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSubmitting || isSuccess || !suggestion.trim()}
            className={`p-4 rounded-xl items-center flex-row justify-center mb-8 ${
              !suggestion.trim() ? 'bg-slate-800' : 
              isSuccess ? 'bg-emerald-600' : 'bg-indigo-600'
            }`}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />
            ) : isSuccess ? (
              <Ionicons name="checkmark-circle" size={20} color="#fff" style={{ marginRight: 8 }} />
            ) : (
              <Ionicons name="send" size={18} color="#fff" style={{ marginRight: 8 }} />
            )}
            <Text className={`font-bold ${!suggestion.trim() ? 'text-slate-500' : 'text-white'}`}>
              {isSubmitting ? 'Mengirim...' : isSuccess ? 'Berhasil Terkirim!' : 'Kirim Masukan'}
            </Text>
          </TouchableOpacity>

          {/* Riwayat Masukan */}
          <View className="mb-8">
            <Text className="text-white font-bold mb-4">Riwayat Masukan Saya</Text>
            
            {history.map((item) => (
              <View key={item.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 mb-3">
                <View className="flex-row justify-between items-start mb-2">
                  <Text className="text-slate-400 text-[10px]">{item.date}</Text>
                  <View className={`px-2 py-1 rounded ${item.status === 'Ditanggapi' ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-amber-500/20 border border-amber-500/30'}`}>
                    <Text className={`text-[10px] font-bold ${item.status === 'Ditanggapi' ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {item.status}
                    </Text>
                  </View>
                </View>
                
                <Text className="text-slate-200 text-sm leading-5 mb-1">{item.content}</Text>
                
                {/* Tanggapan Admin */}
                {item.reply && (
                  <View className="mt-3 bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                    <View className="flex-row items-center gap-2 mb-1">
                      <Ionicons name="person-circle" size={16} color="#818cf8" />
                      <Text className="text-indigo-400 text-xs font-bold">Admin Pusat</Text>
                    </View>
                    <Text className="text-slate-400 text-xs leading-5 italic">
                      "{item.reply}"
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
