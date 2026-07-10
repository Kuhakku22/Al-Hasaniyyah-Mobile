import React, { useState } from 'react';
import { View, TextInput, ScrollView, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../../components/AppHeader';
import { AlumniCard } from '../../components/AlumniCard';
import { EmptyState } from '../../components/EmptyState';
import { mockAlumni } from '../../data/mockData';
import { colors } from '../../constants/colors';

export default function AlumniDirectory() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [filterKorda, setFilterKorda] = useState('Semua');

  const kordasList = ['Semua', ...Array.from(new Set(mockAlumni.map(a => a.korda)))];

  const filteredAlumni = mockAlumni.filter(alumni => {
    const matchSearch = alumni.name.toLowerCase().includes(search.toLowerCase());
    const matchKorda = filterKorda === 'Semua' || alumni.korda === filterKorda;
    return matchSearch && matchKorda;
  });

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <AppHeader title="Direktori Alumni" />
      
      {/* Search & Filter */}
      <View className="bg-white px-4 py-3 border-b border-border">
        <View className="flex-row items-center bg-gray-50 border border-border rounded-xl px-3 py-2 mb-3">
          <Ionicons name="search" size={20} color={colors.textLight} />
          <TextInput
            className="flex-1 ml-2 text-text h-8"
            placeholder="Cari nama alumni..."
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={20} color={colors.textLight} />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {kordasList.map(korda => (
            <TouchableOpacity
              key={korda}
              onPress={() => setFilterKorda(korda)}
              className={`px-4 py-2 rounded-full mr-2 ${filterKorda === korda ? 'bg-primary' : 'bg-gray-100'}`}
            >
              <Text className={`font-semibold ${filterKorda === korda ? 'text-white' : 'text-gray-600'}`}>
                {korda}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView className="flex-1 pt-4">
        {filteredAlumni.length > 0 ? (
          filteredAlumni.map(alumni => (
            <AlumniCard 
              key={alumni.id} 
              alumni={alumni} 
              onPress={() => router.push(`/alumni/${alumni.id}`)}
            />
          ))
        ) : (
          <EmptyState 
            icon="people" 
            title="Tidak Ditemukan" 
            description="Alumni dengan kriteria tersebut tidak ditemukan." 
          />
        )}
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
