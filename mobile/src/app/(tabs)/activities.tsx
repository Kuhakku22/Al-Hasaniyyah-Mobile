import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AppHeader } from '../../components/AppHeader';
import { ActivityCard } from '../../components/ActivityCard';
import { EmptyState } from '../../components/EmptyState';
import { mockActivities } from '../../data/mockData';

export default function Activities() {
  const router = useRouter();
  const [filter, setFilter] = useState<'Semua' | 'Terdaftar'>('Semua');

  const filteredActivities = mockActivities.filter(activity => {
    if (filter === 'Terdaftar') return activity.registered;
    return true;
  });

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <AppHeader title="Kegiatan Alumni" />
      
      {/* Tabs Filter */}
      <View className="flex-row bg-white border-b border-border">
        <TouchableOpacity 
          className={`flex-1 py-4 border-b-2 ${filter === 'Semua' ? 'border-primary' : 'border-transparent'}`}
          onPress={() => setFilter('Semua')}
        >
          <Text className={`text-center font-bold ${filter === 'Semua' ? 'text-primary' : 'text-textLight'}`}>Semua Kegiatan</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className={`flex-1 py-4 border-b-2 ${filter === 'Terdaftar' ? 'border-primary' : 'border-transparent'}`}
          onPress={() => setFilter('Terdaftar')}
        >
          <Text className={`text-center font-bold ${filter === 'Terdaftar' ? 'text-primary' : 'text-textLight'}`}>Terdaftar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 pt-4">
        {filteredActivities.length > 0 ? (
          filteredActivities.map(activity => (
            <ActivityCard 
              key={activity.id} 
              activity={activity} 
              onPress={() => router.push(`/activities/${activity.id}`)}
            />
          ))
        ) : (
          <EmptyState 
            icon="calendar" 
            title="Tidak Ada Kegiatan" 
            description="Belum ada kegiatan yang sesuai dengan filter Anda." 
          />
        )}
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
