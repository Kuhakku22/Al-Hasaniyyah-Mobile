import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StatusBar, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../components/AppHeader';
import { mockJobs, Job } from '../data/mockData';

const JOB_TYPES = ['Semua', 'Full-time', 'Part-time', 'Remote', 'Contract'] as const;

export default function LokerScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('Semua');
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedJobId(prev => (prev === id ? null : id));
  };

  const handleApply = (job: Job) => {
    // Simulasi kontak rekrutmen via WhatsApp alumni
    const message = `Assalamualaikum wr. wb. Saya ingin bertanya terkait lowongan pekerjaan sebagai *${job.position}* di *${job.company}* yang diunggah di aplikasi portal Alumni Al Hasaniyyah.`;
    const url = `https://wa.me/6281234567890?text=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch(() => {
      alert('Gagal membuka WhatsApp. Silakan periksa koneksi internet atau aplikasi WhatsApp Anda.');
    });
  };

  // Filter lowongan berdasarkan pencarian dan tipe
  const filteredJobs = mockJobs.filter((item) => {
    const matchesSearch = item.position.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = selectedType === 'Semua' || item.type === selectedType;
    
    return matchesSearch && matchesType;
  });

  return (
    <SafeAreaView className="flex-1 bg-slate-900" edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#166534" />
      <AppHeader title="Lowongan Kerja Alumni" showBack />

      {/* Search Bar */}
      <View className="p-4 border-b border-slate-800">
        <View className="relative justify-center">
          <Ionicons name="search" size={18} color="#94a3b8" style={{ position: 'absolute', left: 16, zIndex: 10 }} />
          <TextInput 
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Cari posisi, perusahaan, kota..."
            placeholderTextColor="#64748b"
            className="w-full bg-slate-950 p-3 pl-12 text-sm rounded-xl border border-slate-800 focus:border-primary text-white"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              onPress={() => setSearchQuery('')}
              style={{ position: 'absolute', right: 16, zIndex: 10 }}
            >
              <Ionicons name="close-circle" size={18} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Type Filter Buttons */}
      <View className="py-3 border-b border-slate-800/50">
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        >
          {JOB_TYPES.map((type) => {
            const isActive = selectedType === type;
            return (
              <TouchableOpacity
                key={type}
                onPress={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-full border ${isActive ? 'bg-primary border-primary' : 'bg-slate-800 border-slate-700'}`}
              >
                <Text className={`text-xs font-bold ${isActive ? 'text-white' : 'text-slate-400'}`}>
                  {type}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Jobs List */}
      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => {
            const isExpanded = expandedJobId === job.id;
            return (
              <View 
                key={job.id} 
                className="bg-slate-800 rounded-2xl border border-slate-700/80 mb-4 overflow-hidden"
              >
                {/* Header Card */}
                <TouchableOpacity 
                  onPress={() => toggleExpand(job.id)}
                  activeOpacity={0.8}
                  className="p-4 flex-row justify-between items-start"
                >
                  <View className="flex-1 pr-3">
                    <Text className="text-white font-bold text-base mb-1">{job.position}</Text>
                    <Text className="text-gold font-semibold text-xs mb-2">{job.company}</Text>
                    
                    <View className="flex-row flex-wrap gap-2">
                      <View className="bg-slate-900/60 px-2 py-1 rounded-md flex-row items-center border border-slate-700/40">
                        <Ionicons name="location-outline" size={12} color="#94a3b8" style={{ marginRight: 4 }} />
                        <Text className="text-[10px] text-slate-400 font-semibold">{job.location}</Text>
                      </View>
                      <View className="bg-primary/20 px-2 py-1 rounded-md flex-row items-center border border-primary/20">
                        <Ionicons name="briefcase-outline" size={12} color="#22c55e" style={{ marginRight: 4 }} />
                        <Text className="text-[10px] text-emerald-400 font-bold">{job.type}</Text>
                      </View>
                    </View>
                  </View>

                  <Ionicons 
                    name={isExpanded ? 'chevron-down' : 'chevron-forward'} 
                    size={20} 
                    color="#94a3b8" 
                  />
                </TouchableOpacity>

                {/* Details Section */}
                {isExpanded && (
                  <View className="px-4 pb-4 pt-2 border-t border-slate-700/50 bg-slate-800/40">
                    <Text className="text-white font-bold text-xs mb-2">Deskripsi Pekerjaan:</Text>
                    <Text className="text-slate-400 text-xs leading-5 mb-4">{job.description}</Text>

                    <Text className="text-white font-bold text-xs mb-2">Persyaratan:</Text>
                    <View className="mb-4">
                      {job.requirements.map((req, idx) => (
                        <View key={idx} className="flex-row items-start mb-1 px-1">
                          <Text className="text-gold font-bold text-xs mr-2">•</Text>
                          <Text className="text-slate-400 text-xs flex-1 leading-5">{req}</Text>
                        </View>
                      ))}
                    </View>

                    <TouchableOpacity
                      onPress={() => handleApply(job)}
                      className="bg-primary py-3.5 rounded-xl items-center flex-row justify-center active:opacity-85 shadow-md shadow-emerald-950"
                    >
                      <Ionicons name="logo-whatsapp" size={18} color="#fff" style={{ marginRight: 8 }} />
                      <Text className="text-white font-bold text-sm">Hubungi via WhatsApp</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })
        ) : (
          <View className="items-center justify-center py-20 px-8">
            <View className="w-16 h-16 bg-slate-800 rounded-full items-center justify-center mb-4 border border-slate-700">
              <Ionicons name="briefcase-outline" size={32} color="#64748b" />
            </View>
            <Text className="text-slate-300 font-bold text-base mb-1">Lowongan Tidak Ditemukan</Text>
            <Text className="text-slate-500 text-xs text-center leading-5">
              Coba ganti kata pencarian atau pilih kategori tipe kerja yang lain.
            </Text>
          </View>
        )}
        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
