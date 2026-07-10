import React from 'react';
import { View, Text, ScrollView, Image } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../../components/AppHeader';
import { mockNews } from '../../data/mockData';
import { colors } from '../../constants/colors';

export default function NewsDetail() {
  const { id } = useLocalSearchParams();
  const news = mockNews.find(n => n.id === id);

  if (!news) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <AppHeader title="Detail Berita" showBack />
        <View className="flex-1 justify-center items-center">
          <Text className="text-textLight">Berita tidak ditemukan</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <AppHeader title="Berita" showBack />
      
      <ScrollView className="flex-1">
        <Image source={{ uri: news.image }} className="w-full h-56 bg-gray-200" />
        
        <View className="p-4">
          <View className="flex-row items-center mb-2">
            <Text className="text-xs font-bold text-primary uppercase mr-3">{news.category}</Text>
            <View className="flex-row items-center">
              <Ionicons name="calendar-outline" size={12} color={colors.textLight} />
              <Text className="text-xs text-textLight ml-1">{news.date}</Text>
            </View>
          </View>
          
          <Text className="text-2xl font-bold text-text mb-4 leading-tight">{news.title}</Text>
          
          <View className="flex-row items-center mb-6 border-b border-border pb-4">
            <View className="w-8 h-8 rounded-full bg-gray-200 mr-2 items-center justify-center">
              <Ionicons name="person" size={16} color={colors.textLight} />
            </View>
            <View>
              <Text className="text-xs text-textLight">Ditulis oleh</Text>
              <Text className="text-sm font-semibold text-text">{news.author}</Text>
            </View>
          </View>

          <Text className="text-base text-text leading-relaxed">
            {news.content}{'\n\n'}
            (Ini adalah contoh isi berita. Aplikasi ini mendukung penuh pembacaan artikel yang panjang dengan format yang nyaman dan mudah dibaca oleh alumni.)
          </Text>
        </View>
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
