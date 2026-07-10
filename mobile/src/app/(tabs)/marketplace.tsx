import React from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AppHeader } from '../../components/AppHeader';
import { ProductCard } from '../../components/ProductCard';
import { mockProducts } from '../../data/mockData';

export default function Marketplace() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <AppHeader title="Usaha Alumni" />
      
      <ScrollView className="flex-1 px-4 pt-4">
        <View className="flex-row flex-wrap justify-between">
          {mockProducts.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onPress={() => router.push(`/marketplace/${product.id}`)}
            />
          ))}
        </View>
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
