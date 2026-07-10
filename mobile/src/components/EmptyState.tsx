import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description }) => {
  return (
    <View className="flex-1 justify-center items-center p-8 mt-10">
      <View className="w-20 h-20 rounded-full bg-gray-100 items-center justify-center mb-4">
        <Ionicons name={icon} size={40} color={colors.textLight} />
      </View>
      <Text className="text-lg font-bold text-text text-center mb-2">{title}</Text>
      <Text className="text-sm text-textLight text-center">{description}</Text>
    </View>
  );
};
