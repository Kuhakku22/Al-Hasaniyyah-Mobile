import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../components/AppHeader';
import { mockLibrary, LibraryItem } from '../data/mockData';

const LIBRARY_CATEGORIES = ['Semua', 'Buku', 'Artikel', 'Makalah', 'Penelitian', 'Puisi'] as const;

export default function PerpustakaanScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedItemId(prev => (prev === id ? null : id));
  };

  const handleRead = (item: LibraryItem) => {
    Alert.alert(
      'Membuka Dokumen',
      `Sedang menyiapkan lembar bacaan untuk "${item.title}". Mohon tunggu sebentar...`,
      [{ text: 'OK' }]
    );
  };

  const handleDownload = (item: LibraryItem) => {
    Alert.alert(
      'Mengunduh PDF',
      `File PDF untuk "${item.title}" berhasil ditambahkan ke antrean unduhan.`,
      [{ text: 'Bagus' }]
    );
  };

  // Filter karya tulis berdasarkan pencarian dan kategori
  const filteredLibrary = mockLibrary.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'Semua' || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <SafeAreaView className="flex-1 bg-slate-900" edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#166534" />
      <AppHeader title="Perpustakaan Digital" showBack />

      {/* Search Bar */}
      <View className="p-4 border-b border-slate-800">
        <View className="relative justify-center">
          <Ionicons name="search" size={18} color="#94a3b8" style={{ position: 'absolute', left: 16, zIndex: 10 }} />
          <TextInput 
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Cari judul buku, nama penulis, makalah..."
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

      {/* Category Filter Buttons */}
      <View className="py-3 border-b border-slate-800/50">
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        >
          {LIBRARY_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full border ${isActive ? 'bg-primary border-primary' : 'bg-slate-800 border-slate-700'}`}
              >
                <Text className={`text-xs font-bold ${isActive ? 'text-white' : 'text-slate-400'}`}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Library Items List */}
      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        {filteredLibrary.length > 0 ? (
          filteredLibrary.map((item) => {
            const isExpanded = expandedItemId === item.id;
            
            // Tentukan ikon kategori
            let iconName: keyof typeof Ionicons.glyphMap = 'book-outline';
            if (item.category === 'Artikel') iconName = 'document-text-outline';
            else if (item.category === 'Makalah') iconName = 'journal-outline';
            else if (item.category === 'Penelitian') iconName = 'analytics-outline';
            else if (item.category === 'Puisi') iconName = 'bulb-outline';

            return (
              <View 
                key={item.id} 
                className="bg-slate-800 rounded-2xl border border-slate-700/80 mb-4 overflow-hidden"
              >
                {/* Header Card */}
                <TouchableOpacity 
                  onPress={() => toggleExpand(item.id)}
                  activeOpacity={0.8}
                  className="p-4 flex-row items-center justify-between"
                >
                  <View className="flex-row items-center flex-1 pr-3">
                    <View className="w-10 h-10 bg-slate-900 rounded-xl items-center justify-center mr-3 border border-slate-700">
                      <Ionicons name={iconName} size={20} color="#eab308" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-white font-bold text-sm mb-0.5" numberOfLines={2}>{item.title}</Text>
                      <Text className="text-slate-400 text-xs">{item.author} ({item.year})</Text>
                    </View>
                  </View>

                  <View className="flex-row items-center gap-2">
                    <View className="bg-slate-900 px-2.5 py-1 rounded-md border border-slate-700/50">
                      <Text className="text-[10px] text-slate-300 font-semibold">{item.category}</Text>
                    </View>
                    <Ionicons 
                      name={isExpanded ? 'chevron-down' : 'chevron-forward'} 
                      size={18} 
                      color="#94a3b8" 
                    />
                  </View>
                </TouchableOpacity>

                {/* Details Section */}
                {isExpanded && (
                  <View className="px-4 pb-4 pt-2 border-t border-slate-700/50 bg-slate-800/40">
                    <Text className="text-slate-400 text-xs leading-5 mb-4 italic">
                      &quot;{item.description}&quot;
                    </Text>

                    <View className="flex-row gap-3">
                      <TouchableOpacity
                        onPress={() => handleRead(item)}
                        className="flex-1 bg-primary py-3 rounded-xl items-center flex-row justify-center active:opacity-85 border border-primary-dark"
                      >
                        <Ionicons name="eye-outline" size={16} color="#fff" style={{ marginRight: 6 }} />
                        <Text className="text-white font-bold text-xs">Baca Sekarang</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleDownload(item)}
                        className="flex-1 bg-slate-900 py-3 rounded-xl items-center flex-row justify-center active:opacity-85 border border-slate-700"
                      >
                        <Ionicons name="download-outline" size={16} color="#eab308" style={{ marginRight: 6 }} />
                        <Text className="text-gold font-bold text-xs">Unduh PDF</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            );
          })
        ) : (
          <View className="items-center justify-center py-20 px-8">
            <View className="w-16 h-16 bg-slate-800 rounded-full items-center justify-center mb-4 border border-slate-700">
              <Ionicons name="library-outline" size={32} color="#64748b" />
            </View>
            <Text className="text-slate-300 font-bold text-base mb-1">Karya Tidak Ditemukan</Text>
            <Text className="text-slate-500 text-xs text-center leading-5">
              Coba gunakan pencarian lain atau klik kategori yang berbeda.
            </Text>
          </View>
        )}
        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
