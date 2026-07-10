import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors } from '../constants/colors';

interface AppHeaderProps {
  title: string;
  showBack?: boolean;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ title, showBack = false, rightIcon, onRightPress }) => {
  const router = useRouter();

  return (
    <View className="flex-row items-center justify-between px-4 py-4 bg-primary pt-12">
      <View className="flex-row items-center">
        {showBack && (
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
        )}
        <Text className="text-white text-xl font-bold">{title}</Text>
      </View>
      {rightIcon && (
        <TouchableOpacity onPress={onRightPress}>
          <Ionicons name={rightIcon} size={24} color={colors.white} />
        </TouchableOpacity>
      )}
    </View>
  );
};
