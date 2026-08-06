import React, { useState } from 'react';
import { View, ScrollView, TextInput, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../../components/AppHeader';
import { ProductCard } from '../../components/ProductCard';
import { mockProducts } from '../../data/mockData';

const CATEGORIES = ['Semua', 'Makanan', 'Fashion', 'Buku', 'Jasa'] as const;

export default function Marketplace() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');

  const getProductCategory = (p: any) => {
    const name = p.name.toLowerCase();
    if (name.includes('madu') || name.includes('kurma') || name.includes('kopi')) return 'Makanan';
    if (name.includes('baju') || name.includes('sarung') || name.includes('kasturi') || name.includes('koko') || name.includes('wangi')) return 'Fashion';
    if (name.includes('buku') || name.includes('kitab')) return 'Buku';
    if (name.includes('jasa') || name.includes('desain') || name.includes('website')) return 'Jasa';
    return 'Lainnya';
  };

  const filteredProducts = mockProducts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                          p.ownerName.toLowerCase().includes(search.toLowerCase()) ||
                          p.location.toLowerCase().includes(search.toLowerCase());
    const cat = getProductCategory(p);
    const matchesCategory = selectedCategory === 'Semua' || cat === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <AppHeader title="Usaha Alumni" />
      
      {/* Search Bar */}
      <View className="px-4 pt-4 pb-2">
        <View className="relative justify-center">
          <Ionicons name="search" size={18} color="#94a3b8" style={{ position: 'absolute', left: 16, zIndex: 10 }} />
          <TextInput 
            value={search}
            onChangeText={setSearch}
            placeholder="Cari produk atau nama pemilik usaha..."
            placeholderTextColor="#94a3b8"
            className="w-full bg-white p-3 pl-12 text-sm rounded-xl border border-slate-200 focus:border-primary text-slate-800"
          />
          {search.length > 0 && (
            <TouchableOpacity 
              onPress={() => setSearch('')}
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

      {/* Product List */}
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {filteredProducts.length > 0 ? (
          <View className="flex-row flex-wrap justify-between">
            {filteredProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onPress={() => router.push(`/marketplace/${product.id}`)}
              />
            ))}
          </View>
        ) : (
          <View className="items-center justify-center py-20 px-8">
            <View className="w-16 h-16 bg-slate-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="cart-outline" size={32} color="#94a3b8" />
            </View>
            <Text className="text-slate-800 font-bold text-base mb-1">Produk Tidak Ditemukan</Text>
            <Text className="text-slate-400 text-xs text-center leading-5">
              Coba gunakan kata kunci pencarian yang lain atau ganti kategori.
            </Text>
          </View>
        )}
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
