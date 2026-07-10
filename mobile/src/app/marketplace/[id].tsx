import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StatusBar, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../../components/AppHeader';
import { mockProducts } from '../../data/mockData';

export default function MarketplaceDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const product = mockProducts.find(p => p.id === id);

  if (!product) {
    return (
      <SafeAreaView className="flex-1 bg-slate-900" edges={['top']}>
        <AppHeader title="Detail Produk" showBack />
        <View className="flex-1 justify-center items-center p-4">
          <Ionicons name="alert-circle-outline" size={50} color="#ef4444" />
          <Text className="text-slate-400 mt-4 text-center">Produk tidak ditemukan.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleContactSeller = () => {
    const message = `Assalamualaikum wr. wb. Saya tertarik dengan produk *${product.name}* (Rp ${product.price.toLocaleString('id-ID')}) yang ditawarkan di Aplikasi Portal Alumni Al Hasaniyyah. Apakah masih tersedia?`;
    const url = `https://wa.me/6281234567890?text=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch(() => {
      alert('Gagal membuka WhatsApp. Silakan periksa koneksi internet atau aplikasi WhatsApp Anda.');
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-900" edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#166534" />
      <AppHeader title="Detail Produk Alumni" showBack />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <View className="relative w-full h-80 bg-slate-950">
          <Image 
            source={{ uri: product.image }} 
            className="w-full h-full"
            resizeMode="cover"
          />
          {/* Tag Category (Simulated) */}
          <View className="absolute bottom-4 left-4 bg-emerald-600/90 px-3 py-1.5 rounded-full border border-emerald-500/50">
            <Text className="text-white text-xs font-bold uppercase tracking-wider">Kategori Usaha</Text>
          </View>
        </View>

        {/* Product Info Card */}
        <View className="p-5">
          <Text className="text-white font-black text-2xl mb-2 leading-8">{product.name}</Text>
          
          <View className="flex-row items-center mb-6">
            <Text className="text-emerald-400 font-black text-3xl">
              Rp {product.price.toLocaleString('id-ID')}
            </Text>
          </View>

          <View className="h-px bg-slate-800 mb-6" />

          {/* Description */}
          <Text className="text-slate-300 font-bold text-sm mb-3">Deskripsi Produk:</Text>
          <Text className="text-slate-400 text-sm leading-6 mb-6">
            {product.description}{'\n\n'}
            Produk ini diproduksi dan dikelola langsung oleh alumni Pondok Pesantren Darullughah Wadda'wah. Dengan membeli produk ini, antum turut mendukung kemandirian ekonomi keluarga besar alumni Al Hasaniyyah.
          </Text>

          <View className="h-px bg-slate-800 mb-6" />

          {/* Seller Profile Card */}
          <Text className="text-slate-300 font-bold text-sm mb-3">Profil Penjual:</Text>
          <View className="bg-slate-800 p-4 rounded-2xl border border-slate-700/80 mb-8 flex-row items-center justify-between">
            <View className="flex-row items-center flex-1 pr-3">
              <View className="w-12 h-12 bg-slate-900 rounded-full items-center justify-center border-2 border-primary/40 mr-3">
                <Ionicons name="person" size={24} color="#eab308" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold text-sm mb-0.5">{product.ownerName}</Text>
                <View className="flex-row items-center">
                  <Ionicons name="location-outline" size={12} color="#94a3b8" style={{ marginRight: 3 }} />
                  <Text className="text-slate-400 text-xs">Korda {product.location}</Text>
                </View>
              </View>
            </View>
            
            <TouchableOpacity 
              onPress={() => router.push(`/alumni/${product.ownerId}`)}
              className="bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-700 active:bg-slate-950"
            >
              <Text className="text-gold font-bold text-xs">Buka Profil</Text>
            </TouchableOpacity>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            onPress={handleContactSeller}
            className="w-full bg-emerald-600 py-4 rounded-xl items-center flex-row justify-center active:opacity-85 shadow-md shadow-emerald-950 mb-6"
          >
            <Ionicons name="logo-whatsapp" size={22} color="#fff" style={{ marginRight: 8 }} />
            <Text className="text-white font-bold text-base">Hubungi via WhatsApp</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
