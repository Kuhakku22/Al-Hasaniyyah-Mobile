import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function IuranScreen() {
  const router = useRouter();
  
  // Simulasi data tagihan
  const [bills, setBills] = useState([
    { id: 1, title: 'Iuran Wajib - Agustus 2026', dueDate: '10 Agustus 2026', amount: 25000, status: 'Belum Lunas' },
    { id: 2, title: 'Iuran Wajib - Juli 2026', dueDate: '10 Juli 2026', amount: 25000, status: 'Lunas' },
    { id: 3, title: 'Iuran Wajib - Juni 2026', dueDate: '10 Juni 2026', amount: 25000, status: 'Lunas' }
  ]);

  const [selectedBill, setSelectedBill] = useState<any>(null);
  const [payMethod, setPayMethod] = useState('qris');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      
      // Update status tagihan menjadi Lunas
      setBills(bills.map(b => b.id === selectedBill.id ? { ...b, status: 'Lunas' } : b));
    }, 2000);
  };

  const resetFlow = () => {
    setIsSuccess(false);
    setSelectedBill(null);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-900" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center p-4 border-b border-slate-800">
        <TouchableOpacity 
          onPress={() => {
            if (isSuccess || selectedBill) {
              resetFlow();
            } else {
              router.back();
            }
          }} 
          className="mr-3"
        >
          <Ionicons name="arrow-back" size={24} color="#94a3b8" />
        </TouchableOpacity>
        <Text className="text-white font-bold text-lg">
          {selectedBill && !isSuccess ? 'Pembayaran Iuran' : 'Iuran Wajib Alumni'}
        </Text>
      </View>

      <ScrollView className="flex-1 p-4 space-y-4">
        
        {/* TAMPILAN UTAMA (DAFTAR TAGIHAN) */}
        {!selectedBill && !isSuccess && (
          <View>
            <View className="bg-indigo-900 p-5 rounded-2xl border border-indigo-800 mb-4">
              <Text className="text-[10px] text-indigo-300 uppercase tracking-wider font-bold mb-1">Status Keanggotaan Anda</Text>
              <Text className="text-white font-black text-lg">Ahmad Baidlowi (NIA: 1023001)</Text>
              
              <View className="mt-4 flex-row justify-between items-center">
                <View className={`${bills[0].status === 'Lunas' ? 'bg-emerald-500' : 'bg-rose-500'} px-3 py-1.5 rounded-full`}>
                  <Text className="text-white font-bold text-xs">{bills[0].status === 'Lunas' ? 'Lunas Bulanan' : 'Ada Tunggakan'}</Text>
                </View>
                <Text className="text-indigo-200 text-xs">Hingga: Des 2026</Text>
              </View>
            </View>

            <View className="p-4 bg-slate-950/50 rounded-xl border border-slate-800 mb-6">
              <Text className="font-bold text-slate-300 mb-2">Ketentuan AD/ART Pasal 4:</Text>
              <Text className="text-slate-400 text-xs leading-5">
                Iuran wajib adalah kontribusi rutin bulanan senilai <Text className="font-bold text-white">Rp 25.000</Text> dari setiap alumni terdaftar untuk operasional kesekretariatan & bantuan sosial dhuafa.
              </Text>
            </View>

            <Text className="text-xs font-bold text-slate-400 mb-3">Daftar Tagihan Iuran:</Text>
            
            {bills.map(bill => (
              <View key={bill.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex-row justify-between items-center mb-3">
                <View className="flex-1 pr-4">
                  <Text className="text-white font-bold mb-1">{bill.title}</Text>
                  <Text className="text-[10px] text-slate-400 mb-2">Jatuh Tempo: {bill.dueDate}</Text>
                  
                  {bill.status === 'Belum Lunas' && (
                    <TouchableOpacity 
                      onPress={() => setSelectedBill(bill)}
                      className="bg-gold/20 border border-gold/50 py-1.5 px-3 rounded-lg self-start"
                    >
                      <Text className="text-gold font-bold text-xs">Bayar Sekarang</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View className="items-end">
                  <Text className={`font-bold mb-1 ${bill.status === 'Lunas' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    Rp {bill.amount.toLocaleString('id-ID')}
                  </Text>
                  <View className={`${bill.status === 'Lunas' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'} px-2 py-1 rounded border`}>
                    <Text className={`text-[10px] ${bill.status === 'Lunas' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {bill.status}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* TAMPILAN PEMBAYARAN */}
        {selectedBill && !isSuccess && (
          <View>
            <View className="mb-6 items-center bg-slate-800 p-6 rounded-2xl border border-slate-700">
              <Text className="text-slate-400 text-sm mb-1">{selectedBill.title}</Text>
              <Text className="text-emerald-400 font-black text-3xl">Rp {selectedBill.amount.toLocaleString('id-ID')}</Text>
              <Text className="text-[11px] text-rose-400 mt-2">Jatuh Tempo: {selectedBill.dueDate}</Text>
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
                <Text className="text-white font-bold text-sm">Transfer Bank / Virtual Account</Text>
              </View>
              <View className={`w-5 h-5 rounded-full border items-center justify-center ${payMethod === 'va' ? 'border-blue-500 bg-blue-500' : 'border-slate-500'}`}>
                {payMethod === 'va' && <View className="w-2 h-2 bg-white rounded-full" />}
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={handlePay}
              disabled={isProcessing}
              className={`bg-emerald-600 p-4 rounded-xl items-center flex-row justify-center ${isProcessing ? 'opacity-70' : 'active:opacity-80'}`}
            >
              {isProcessing ? (
                <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />
              ) : null}
              <Text className="text-white font-bold text-base">{isProcessing ? 'Memproses...' : 'Selesaikan Pembayaran'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* TAMPILAN SUKSES PEMBAYARAN */}
        {isSuccess && (
          <View className="items-center py-10 px-4">
            <View className="w-20 h-20 bg-emerald-500/20 rounded-full items-center justify-center mb-6">
              <Ionicons name="checkmark-circle" size={50} color="#10b981" />
            </View>
            <Text className="text-white font-bold text-2xl mb-2">Pembayaran Berhasil!</Text>
            <Text className="text-slate-400 text-center mb-8">Terima kasih, iuran wajib bulanan Anda telah tercatat lunas di sistem kami.</Text>
            
            <View className="w-full bg-slate-800 p-5 rounded-2xl mb-8 border border-slate-700">
              <View className="flex-row justify-between mb-3"><Text className="text-slate-400">Periode</Text><Text className="text-white font-bold">{selectedBill?.title.replace('Iuran Wajib - ', '')}</Text></View>
              <View className="flex-row justify-between mb-3"><Text className="text-slate-400">Nominal</Text><Text className="text-emerald-400 font-bold">Rp 25.000</Text></View>
              <View className="flex-row justify-between mb-3"><Text className="text-slate-400">Metode</Text><Text className="text-white">{payMethod === 'qris' ? 'QRIS' : 'Transfer Bank'}</Text></View>
              <View className="flex-row justify-between"><Text className="text-slate-400">Status</Text><Text className="text-emerald-400 font-bold">LUNAS</Text></View>
            </View>

            <TouchableOpacity 
              onPress={resetFlow}
              className="w-full bg-blue-600 p-4 rounded-xl items-center"
            >
              <Text className="text-white font-bold">Lihat Riwayat Tagihan</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}
