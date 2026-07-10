import React from 'react';
import { View, Text } from 'react-native';

interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'success' | 'warning' | 'danger';
  text: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, text }) => {
  let bgColor = 'bg-gray-100';
  let textColor = 'text-gray-600';

  switch (status) {
    case 'active':
    case 'success':
      bgColor = 'bg-green-100';
      textColor = 'text-green-700';
      break;
    case 'pending':
    case 'warning':
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-700';
      break;
    case 'inactive':
    case 'danger':
      bgColor = 'bg-red-100';
      textColor = 'text-red-700';
      break;
  }

  return (
    <View className={`px-3 py-1 rounded-full ${bgColor} self-start`}>
      <Text className={`text-xs font-bold ${textColor}`}>{text}</Text>
    </View>
  );
};
