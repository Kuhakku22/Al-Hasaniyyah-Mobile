import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../components/AppHeader';
import { NewsCard } from '../components/NewsCard';
import { mockNews } from '../data/mockData';
import { colors } from '../constants/colors';

const CATEGORIES = ['Semua', 'Pusat', 'Korda', 'Prestasi', 'Pengumuman'] as const;
type CategoryType = typeof CATEGORIES[number];

export default function BeritaScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('Semua');

  // Filter berita berdasarkan pencarian dan kategori
  const filteredNews = mockNews.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'Semua' || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#166534" />
      <AppHeader title="Berita & Pengumuman" showBack />
      
      {/* Search Bar */}
      <View className="px-4 pt-4 pb-2">
        <View className="relative justify-center">
          <Ionicons name="search" size={18} color="#94a3b8" style={{ position: 'absolute', left: 16, zIndex: 10 }} />
          <TextInput 
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Cari berita atau pengumuman..."
            placeholderTextColor="#94a3b8"
            className="w-full bg-white p-3 pl-12 text-sm rounded-xl border border-slate-200 focus:border-primary text-slate-800"
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

      {/* Category Slider */}
      <View className="py-2 mb-2">
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        >
          {CATEGORIES.map((category) => {
            const isActive = selectedCategory === category;
            return (
              <TouchableOpacity
                key={category}
                onPress={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full border ${isActive ? 'bg-primary border-primary' : 'bg-white border-slate-200'}`}
              >
                <Text className={`text-xs font-bold ${isActive ? 'text-white' : 'text-slate-600'}`}>
                  {category}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* News List */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {filteredNews.length > 0 ? (
          filteredNews.map((news) => (
            <NewsCard 
              key={news.id} 
              news={news} 
              onPress={() => router.push(`/news/${news.id}`)}
            />
          ))
        ) : (
          <View className="items-center justify-center py-20 px-8">
            <View className="w-16 h-16 bg-slate-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="newspaper-outline" size={32} color="#94a3b8" />
            </View>
            <Text className="text-slate-800 font-bold text-base mb-1">Berita Tidak Ditemukan</Text>
            <Text className="text-slate-400 text-xs text-center leading-5">
              Silakan coba kata kunci lain atau pilih kategori yang berbeda.
            </Text>
          </View>
        )}
        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
