import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';

interface ConsultItem {
  id: string | number;
  date: string;
  content: string;
  status: string;
  reply?: string;
}

const INITIAL_HISTORY: ConsultItem[] = [
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
];

export default function KonsultasiScreen() {
  const router = useRouter();
  
  const [suggestion, setSuggestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [history, setHistory] = useState<ConsultItem[]>([]);
  const [alumniId, setAlumniId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSessionAndData = async () => {
    try {
      setLoading(true);
      const storedToken = await AsyncStorage.getItem('userToken');
      setAlumniId(storedToken);

      if (!storedToken || storedToken === '00000000-0000-0000-0000-000000000000') {
        // Mode uji coba atau belum login
        setHistory(INITIAL_HISTORY);
        return;
      }

      const { data, error } = await supabase
        .from('konsultasi_saran')
        .select('*')
        .eq('alumni_id', storedToken)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const formatted: ConsultItem[] = data.map(item => {
          const dateObj = new Date(item.created_at);
          const dateStr = dateObj.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          });
          return {
            id: item.id,
            date: dateStr,
            content: item.isi_masukan,
            status: item.status,
            reply: item.tanggapan || undefined
          };
        });
        setHistory(formatted);
      } else {
        setHistory([]);
      }
    } catch (e) {
      console.warn("Gagal memuat konsultasi dari Supabase, menggunakan data lokal:", e);
      setHistory(INITIAL_HISTORY);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessionAndData();
  }, []);

  const handleSubmit = async () => {
    if (!suggestion.trim()) return;

    setIsSubmitting(true);
    
    // Fallback/Simulasi untuk Mode Uji Coba
    if (!alumniId || alumniId === '00000000-0000-0000-0000-000000000000') {
      setTimeout(() => {
        setIsSubmitting(false);
        setIsSuccess(true);
        const newEntry = {
          id: Date.now(),
          date: 'Hari ini',
          content: suggestion,
          status: 'Menunggu Tanggapan'
        };
        setHistory([newEntry, ...history]);
        setTimeout(() => {
          setIsSuccess(false);
          setSuggestion('');
        }, 3000);
      }, 1500);
      return;
    }

    try {
      const { error } = await supabase
        .from('konsultasi_saran')
        .insert([
          {
            alumni_id: alumniId,
            isi_masukan: suggestion,
            status: 'Menunggu Tanggapan'
          }
        ]);

      if (error) throw error;

      setIsSuccess(true);
      setSuggestion('');
      await loadSessionAndData(); // Refresh history
      
      setTimeout(() => {
        setIsSuccess(false);
      }, 3000);
    } catch (e: any) {
      alert('Gagal mengirim saran: ' + e.message);
    } finally {
      setIsSubmitting(false);
    }
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
            
            {loading ? (
              <View className="py-10 items-center justify-center">
                <ActivityIndicator size="small" color="#818cf8" />
                <Text className="text-slate-500 text-xs mt-2">Memuat riwayat...</Text>
              </View>
            ) : history.length > 0 ? (
              history.map((item) => (
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
                        &quot;{item.reply}&quot;
                      </Text>
                    </View>
                  )}
                </View>
              ))
            ) : (
              <Text className="text-center text-slate-500 text-sm py-10">Belum ada saran yang dikirim.</Text>
            )}
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
