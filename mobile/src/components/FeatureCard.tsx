import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

interface FeatureCardProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  color?: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ title, icon, onPress, color = colors.primary }) => {
  return (
    <TouchableOpacity 
      onPress={onPress}
      className="bg-white p-4 rounded-xl shadow-sm items-center justify-start w-[31%] mb-4 border border-border"
    >
      <View className="w-12 h-12 rounded-full items-center justify-center mb-2" style={{ backgroundColor: `${color}15` }}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text className="text-text text-xs text-center font-medium" numberOfLines={2}>{title}</Text>
    </TouchableOpacity>
  );
};
