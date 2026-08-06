import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';

const INFAK_CATEGORIES = [
  { id: "umum", label: "Infak Umum", desc: "Untuk kebutuhan operasional dan program umum" },
  { id: "beasiswa", label: "Beasiswa Santri", desc: "Dukung pendidikan santri berprestasi/kurang mampu" },
  { id: "pembangunan", label: "Pembangunan", desc: "Wakaf pembangunan fasilitas asrama & kelas" },
  { id: "bansos", label: "Bantuan Sosial", desc: "Program bantuan kemanusiaan & kebencanaan" },
];

export default function InfakScreen() {
  const router = useRouter();
  const [alumniId, setAlumniId] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [selectedCat, setSelectedCat] = useState(INFAK_CATEGORIES[0]);
  const [amount, setAmount] = useState('10000');
  const [payMethod, setPayMethod] = useState('qris');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('userToken');
        setAlumniId(storedToken);
      } catch (e) {
        console.error(e);
      }
    };
    loadSession();
  }, []);

  const handlePay = async () => {
    setIsProcessing(true);

    if (!alumniId || alumniId === '00000000-0000-0000-0000-000000000000') {
      // Simulasi proses API untuk Mode Uji Coba
      setTimeout(() => {
        setIsProcessing(false);
        setIsSuccess(true);
      }, 1500);
      return;
    }

    try {
      const ref = 'INF-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      let dbKategori = 'infak_umum';
      if (selectedCat.id === 'beasiswa') dbKategori = 'beasiswa';
      else if (selectedCat.id === 'pembangunan') dbKategori = 'pembangunan';
      else if (selectedCat.id === 'bansos') dbKategori = 'bansos';

      const { error } = await supabase
        .from('transaksi_infak')
        .insert([
          {
            alumni_id: alumniId,
            kategori: dbKategori,
            nominal: parseFloat(amount) || 0,
            metode_bayar: payMethod,
            status: 'success',
            payment_ref: ref,
            paid_at: new Date().toISOString()
          }
        ]);

      if (error) throw error;

      setIsProcessing(false);
      setIsSuccess(true);
    } catch (e: any) {
      alert('Transaksi infak gagal: ' + e.message);
      setIsProcessing(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-900" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center p-4 border-b border-slate-800">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#94a3b8" />
        </TouchableOpacity>
        <Text className="text-white font-bold text-lg">Fitur Infak Mandiri</Text>
      </View>

      <ScrollView className="flex-1 p-4">
        {!isSuccess && (
          <View className="bg-slate-800 p-3 rounded-xl mb-6 flex-row justify-between items-center border border-slate-700">
            <Text className={`text-xs font-bold ${step >= 1 ? 'text-emerald-400' : 'text-slate-500'}`}>1. Kategori</Text>
            <Ionicons name="chevron-forward" size={12} color="#475569" />
            <Text className={`text-xs font-bold ${step >= 2 ? 'text-emerald-400' : 'text-slate-500'}`}>2. Nominal</Text>
            <Ionicons name="chevron-forward" size={12} color="#475569" />
            <Text className={`text-xs font-bold ${step >= 3 ? 'text-emerald-400' : 'text-slate-500'}`}>3. Pembayaran</Text>
          </View>
        )}

        {/* Step 1: Kategori */}
        {step === 1 && (
          <View className="space-y-3">
            <Text className="text-slate-400 font-bold mb-3">Pilih Kategori Infak:</Text>
            {INFAK_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => {
                  setSelectedCat(cat);
                  setStep(2);
                }}
                className={`p-4 rounded-2xl border flex-row justify-between items-center mb-3 ${
                  selectedCat.id === cat.id ? 'bg-emerald-900/30 border-emerald-500' : 'bg-slate-800 border-slate-700'
                }`}
              >
                <View className="flex-1 pr-4">
                  <Text className={`font-bold mb-1 ${selectedCat.id === cat.id ? 'text-white' : 'text-slate-200'}`}>{cat.label}</Text>
                  <Text className="text-xs text-slate-400">{cat.desc}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={selectedCat.id === cat.id ? '#10b981' : '#64748b'} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Step 2: Nominal */}
        {step === 2 && (
          <View>
            <View className="mb-6">
              <Text className="text-slate-400 text-xs mb-1">Kategori Terpilih:</Text>
              <Text className="text-emerald-400 font-bold text-lg">{selectedCat.label}</Text>
            </View>

            <Text className="text-slate-400 font-bold mb-2">Masukkan Nominal:</Text>
            <View className="relative justify-center mb-6">
              <Text className="absolute left-4 z-10 text-slate-400 font-bold text-lg">Rp</Text>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                className="bg-slate-950 border border-slate-700 text-white font-bold text-lg rounded-xl p-4 pl-12"
              />
            </View>

            <View className="flex-row flex-wrap justify-between mb-8 gap-y-3">
              {['10000', '25000', '50000', '100000', '250000', '500000'].map((val) => (
                <TouchableOpacity
                  key={val}
                  onPress={() => setAmount(val)}
                  className={`w-[31%] py-3 rounded-xl border items-center ${
                    amount === val ? 'bg-emerald-600 border-emerald-500' : 'bg-slate-800 border-slate-700'
                  }`}
                >
                  <Text className={`font-bold text-xs ${amount === val ? 'text-white' : 'text-slate-300'}`}>
                    {parseInt(val).toLocaleString('id-ID')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity onPress={() => setStep(1)} className="flex-1 bg-slate-800 p-4 rounded-xl items-center">
                <Text className="text-white font-bold">Kembali</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setStep(3)} className="flex-1 bg-emerald-600 p-4 rounded-xl items-center">
                <Text className="text-white font-bold">Lanjutkan</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Step 3: Pembayaran */}
        {step === 3 && !isSuccess && (
          <View>
            <View className="mb-8 items-center bg-slate-800 p-6 rounded-2xl border border-slate-700">
              <Text className="text-slate-400 text-sm mb-1">{selectedCat.label}</Text>
              <Text className="text-emerald-400 font-black text-3xl">Rp {parseInt(amount || '0').toLocaleString('id-ID')}</Text>
            </View>

            <Text className="text-slate-400 font-bold mb-3">Pilih Metode Pembayaran:</Text>
            
            <TouchableOpacity 
              onPress={() => setPayMethod('qris')}
              className={`p-4 rounded-xl border flex-row justify-between items-center mb-3 ${
                payMethod === 'qris' ? 'bg-blue-900/30 border-blue-500' : 'bg-slate-800 border-slate-700'
              }`}
            >
              <View className="flex-row items-center gap-3">
                <View className="bg-red-600 px-2 py-1 rounded"><Text className="text-[10px] text-white font-bold">QRIS</Text></View>
                <Text className="text-white font-bold text-sm">QRIS (GoPay, DANA, OVO)</Text>
              </View>
              <View className={`w-5 h-5 rounded-full border items-center justify-center ${payMethod === 'qris' ? 'border-blue-500 bg-blue-500' : 'border-slate-500'}`}>
                {payMethod === 'qris' && <View className="w-2 h-2 bg-white rounded-full" />}
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => setPayMethod('va')}
              className={`p-4 rounded-xl border flex-row justify-between items-center mb-8 ${
                payMethod === 'va' ? 'bg-blue-900/30 border-blue-500' : 'bg-slate-800 border-slate-700'
              }`}
            >
              <View className="flex-row items-center gap-3">
                <View className="bg-slate-600 px-2 py-1 rounded"><Text className="text-[10px] text-white font-bold">VA</Text></View>
                <Text className="text-white font-bold text-sm">Virtual Account Transfer</Text>
              </View>
              <View className={`w-5 h-5 rounded-full border items-center justify-center ${payMethod === 'va' ? 'border-blue-500 bg-blue-500' : 'border-slate-500'}`}>
                {payMethod === 'va' && <View className="w-2 h-2 bg-white rounded-full" />}
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={handlePay}
              disabled={isProcessing}
              className={`bg-emerald-600 p-4 rounded-xl items-center flex-row justify-center ${isProcessing ? 'opacity-70' : ''}`}
            >
              {isProcessing ? (
                <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />
              ) : null}
              <Text className="text-white font-bold text-base">{isProcessing ? 'Memproses...' : 'Bayar Sekarang'}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => setStep(2)} className="mt-4 p-4 items-center">
              <Text className="text-slate-400">Kembali</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Sukses */}
        {isSuccess && (
          <View className="items-center py-10 px-4">
            <View className="w-20 h-20 bg-emerald-500/20 rounded-full items-center justify-center mb-6">
              <Ionicons name="checkmark-circle" size={50} color="#10b981" />
            </View>
            <Text className="text-white font-bold text-2xl mb-2">Pembayaran Sukses!</Text>
            <Text className="text-slate-400 text-center mb-8">Jazakumullah Khairan. Infak Anda telah kami terima.</Text>
            
            <View className="w-full bg-slate-800 p-5 rounded-2xl mb-8 border border-slate-700">
              <View className="flex-row justify-between mb-3"><Text className="text-slate-400">Kategori</Text><Text className="text-white font-bold">{selectedCat.label}</Text></View>
              <View className="flex-row justify-between mb-3"><Text className="text-slate-400">Nominal</Text><Text className="text-emerald-400 font-bold">Rp {parseInt(amount).toLocaleString('id-ID')}</Text></View>
              <View className="flex-row justify-between mb-3"><Text className="text-slate-400">Metode</Text><Text className="text-white">{payMethod === 'qris' ? 'QRIS' : 'VA'}</Text></View>
              <View className="flex-row justify-between"><Text className="text-slate-400">Status</Text><Text className="text-emerald-400">Berhasil</Text></View>
            </View>

            <TouchableOpacity 
              onPress={() => router.push('/(tabs)/home')}
              className="w-full bg-blue-600 p-4 rounded-xl items-center"
            >
              <Text className="text-white font-bold">Kembali ke Beranda</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
