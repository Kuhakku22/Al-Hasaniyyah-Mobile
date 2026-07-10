import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Mock Data Tanggal Hari Ini (Anggap saja hari ini 3 Agustus 2026 untuk simulasi H-3)
const TODAY = new Date('2026-08-03');

const AGENDA_DATA = [
  { id: 1, title: "Pengajian Al Hikam (Jum'at Legi)", date: "2026-08-06", time: "18:00 WIB", location: "PP. Darullughah Wadda'wah", type: "rutin" },
  { id: 2, title: "Multaqo Nasional (Reuni Akbar)", date: "2026-08-20", time: "08:00 WIB", location: "Pasuruan, Jawa Timur", type: "besar" },
  { id: 3, title: "Pengajian Al Hikam (Jum'at Legi)", date: "2026-09-10", time: "18:00 WIB", location: "PP. Darullughah Wadda'wah", type: "rutin" },
  { id: 4, title: "Pengajian Al Hikam (Jum'at Legi)", date: "2026-10-15", time: "18:00 WIB", location: "PP. Darullughah Wadda'wah", type: "rutin" },
  { id: 5, title: "Pengajian Al Hikam (Jum'at Legi)", date: "2026-11-19", time: "18:00 WIB", location: "PP. Darullughah Wadda'wah", type: "rutin" },
  { id: 6, title: "Pengajian Al Hikam (Jum'at Legi)", date: "2026-12-24", time: "18:00 WIB", location: "PP. Darullughah Wadda'wah", type: "rutin" },
  { id: 7, title: "Mukernas (Musyawarah Kerja Nasional)", date: "2027-08-15", time: "09:00 WIB", location: "Jakarta", type: "besar" },
];

export default function KegiatanScreen() {
  const router = useRouter();
  const [selectedMonth, setSelectedMonth] = useState(8); // Default Agustus
  const [selectedYear, setSelectedYear] = useState(2026);

  // Menghitung H-3
  const calculateDaysLeft = (eventDateStr: string) => {
    const eventDate = new Date(eventDateStr);
    const diffTime = eventDate.getTime() - TODAY.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Filter kegiatan berdasarkan bulan yang dipilih
  const filteredAgenda = AGENDA_DATA.filter(item => {
    const date = new Date(item.date);
    return date.getMonth() + 1 === selectedMonth && date.getFullYear() === selectedYear;
  });

  const getMonthName = (monthNumber: number) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
    return months[monthNumber - 1];
  };

  // Mini Calendar Generator
  const generateMiniCalendar = () => {
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const firstDay = new Date(selectedYear, selectedMonth - 1, 1).getDay();
    
    let days = [];
    // Kosongkan awal bulan jika tidak mulai di hari Minggu
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    // Isi tanggal
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return (
      <View className="bg-slate-800 p-4 rounded-2xl border border-slate-700 mb-6">
        <View className="flex-row justify-between items-center mb-4">
          <TouchableOpacity 
            onPress={() => {
              if (selectedMonth === 1) { setSelectedMonth(12); setSelectedYear(y => y - 1); }
              else setSelectedMonth(m => m - 1);
            }}
          >
            <Ionicons name="chevron-back" size={20} color="#94a3b8" />
          </TouchableOpacity>
          <Text className="text-white font-bold text-base">{getMonthName(selectedMonth)} {selectedYear}</Text>
          <TouchableOpacity 
            onPress={() => {
              if (selectedMonth === 12) { setSelectedMonth(1); setSelectedYear(y => y + 1); }
              else setSelectedMonth(m => m + 1);
            }}
          >
            <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-between mb-2">
          {['M', 'S', 'S', 'R', 'K', 'J', 'S'].map((d, i) => (
            <Text key={i} className="text-slate-500 font-bold w-8 text-center text-xs">{d}</Text>
          ))}
        </View>

        <View className="flex-row flex-wrap">
          {days.map((day, idx) => {
            // Cek apakah hari ini ada agenda
            let hasEvent = false;
            let eventType = '';
            if (day) {
              const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const event = AGENDA_DATA.find(e => e.date === dateStr);
              if (event) {
                hasEvent = true;
                eventType = event.type;
              }
            }

            return (
              <View key={idx} className="w-[14.28%] p-1">
                {day ? (
                  <View className={`w-8 h-8 rounded-full items-center justify-center ${hasEvent ? (eventType === 'besar' ? 'bg-rose-500' : 'bg-emerald-500') : 'bg-transparent'}`}>
                    <Text className={`text-xs font-bold ${hasEvent ? 'text-white' : 'text-slate-300'}`}>{day}</Text>
                  </View>
                ) : (
                  <View className="w-8 h-8" />
                )}
              </View>
            );
          })}
        </View>
        <View className="flex-row justify-center gap-4 mt-3 pt-3 border-t border-slate-700">
           <View className="flex-row items-center gap-1"><View className="w-2 h-2 rounded-full bg-emerald-500" /><Text className="text-[10px] text-slate-400">Pengajian/Rutin</Text></View>
           <View className="flex-row items-center gap-1"><View className="w-2 h-2 rounded-full bg-rose-500" /><Text className="text-[10px] text-slate-400">Acara Besar</Text></View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-900" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center p-4 border-b border-slate-800">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#94a3b8" />
        </TouchableOpacity>
        <Text className="text-white font-bold text-lg">Kalender Kegiatan</Text>
      </View>

      <ScrollView className="flex-1 p-4">
        {generateMiniCalendar()}

        <Text className="text-white font-bold text-sm mb-4">Agenda {getMonthName(selectedMonth)} {selectedYear}</Text>

        {filteredAgenda.length === 0 ? (
          <View className="items-center py-10">
            <Ionicons name="calendar-outline" size={50} color="#334155" />
            <Text className="text-slate-500 mt-4 text-center">Tidak ada agenda di bulan ini.</Text>
          </View>
        ) : (
          filteredAgenda.map(item => {
            const dateObj = new Date(item.date);
            const daysLeft = calculateDaysLeft(item.date);
            
            return (
              <View key={item.id} className="bg-slate-800 rounded-xl mb-4 border border-slate-700 overflow-hidden flex-row">
                <View className={`${item.type === 'besar' ? 'bg-rose-500' : 'bg-emerald-600'} w-20 items-center justify-center p-2`}>
                  <Text className="text-white font-black text-2xl">{dateObj.getDate()}</Text>
                  <Text className="text-white/80 font-bold text-xs uppercase">{getMonthName(dateObj.getMonth() + 1)}</Text>
                </View>
                
                <View className="p-4 flex-1">
                  <View className="flex-row justify-between items-start mb-1">
                    <Text className="text-white font-bold flex-1 pr-2 leading-5">{item.title}</Text>
                    
                    {/* NOTIFIKASI H-3 */}
                    {daysLeft > 0 && daysLeft <= 3 && (
                      <View className="bg-gold px-2 py-1 rounded flex-row items-center">
                        <Ionicons name="alert-circle" size={12} color="#78350f" style={{marginRight: 4}} />
                        <Text className="text-[10px] text-amber-900 font-bold">H-{daysLeft}</Text>
                      </View>
                    )}
                  </View>
                  
                  <View className="flex-row items-center gap-2 mt-2">
                    <Ionicons name="time-outline" size={14} color="#94a3b8" />
                    <Text className="text-slate-400 text-xs">{item.time}</Text>
                  </View>
                  <View className="flex-row items-center gap-2 mt-1">
                    <Ionicons name="location-outline" size={14} color="#94a3b8" />
                    <Text className="text-slate-400 text-xs">{item.location}</Text>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
