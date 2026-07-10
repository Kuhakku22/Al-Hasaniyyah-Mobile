import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Product } from '../data/mockData';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { formatCurrency } from '../utils/format';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onPress }) => {
  return (
    <TouchableOpacity 
      onPress={onPress}
      className="bg-white rounded-xl shadow-sm border border-border overflow-hidden mb-4"
      style={{ width: '48%' }}
    >
      <Image source={{ uri: product.image }} className="w-full h-32 bg-gray-200" />
      <View className="p-3">
        <Text className="text-sm font-bold text-text mb-1" numberOfLines={2}>{product.name}</Text>
        <Text className="text-sm font-bold text-primary mb-2">{formatCurrency(product.price)}</Text>
        <View className="flex-row items-center mb-1">
          <Ionicons name="person-outline" size={12} color={colors.textLight} />
          <Text className="text-xs text-textLight ml-1 truncate" numberOfLines={1}>{product.ownerName}</Text>
        </View>
        <View className="flex-row items-center">
          <Ionicons name="location-outline" size={12} color={colors.textLight} />
          <Text className="text-xs text-textLight ml-1 truncate" numberOfLines={1}>{product.location}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};
