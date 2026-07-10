import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { colors } from '../constants/colors';

interface SectionHeaderProps {
  title: string;
  actionText?: string;
  onActionPress?: () => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, actionText, onActionPress }) => {
  return (
    <View className="flex-row items-center justify-between py-4 px-4">
      <Text className="text-lg font-bold text-text">{title}</Text>
      {actionText && (
        <TouchableOpacity onPress={onActionPress}>
          <Text className="text-sm font-semibold" style={{ color: colors.primary }}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
