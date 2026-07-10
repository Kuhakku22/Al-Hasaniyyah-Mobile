import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Onboarding() {
  const router = useRouter();

  const handleContinue = async () => {
    await AsyncStorage.setItem('hasLaunched', 'true');
    router.replace('/login');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center items-center px-8">
        <View className="w-32 h-32 rounded-full bg-primary/10 items-center justify-center mb-8 border-4 border-primary/20">
          <Text className="text-4xl">🕌</Text>
        </View>
        
        <Text className="text-3xl font-bold text-primary mb-4 text-center">
          Al Hasaniyyah Connect
        </Text>
        
        <Text className="text-base text-textLight text-center mb-12">
          Platform resmi untuk menghubungkan seluruh jaringan Alumni, Pengurus Pusat, dan Korda Al Hasaniyyah di seluruh Indonesia.
        </Text>

        <TouchableOpacity 
          onPress={handleContinue}
          className="w-full bg-primary py-4 rounded-xl items-center shadow-sm"
        >
          <Text className="text-white font-bold text-lg">Mulai Sekarang</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
