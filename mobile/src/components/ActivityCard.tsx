import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Activity } from '../data/mockData';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

interface ActivityCardProps {
  activity: Activity;
  onPress: () => void;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({ activity, onPress }) => {
  return (
    <TouchableOpacity 
      onPress={onPress}
      className="bg-white p-4 mx-4 mb-3 rounded-xl shadow-sm border border-border"
    >
      <View className="flex-row justify-between items-start mb-2">
        <Text className="text-base font-bold text-text flex-1 mr-2">{activity.title}</Text>
        <View className={`px-2 py-1 rounded-full ${activity.registered ? 'bg-primaryLight/20' : 'bg-gray-100'}`}>
          <Text className={`text-xs font-semibold ${activity.registered ? 'text-primary' : 'text-gray-500'}`}>
            {activity.registered ? 'Terdaftar' : 'Belum Daftar'}
          </Text>
        </View>
      </View>
      
      <View className="flex-row items-center mb-1">
        <Ionicons name="calendar-outline" size={14} color={colors.textLight} />
        <Text className="text-sm text-textLight ml-2">{activity.date}</Text>
      </View>
      
      <View className="flex-row items-center">
        <Ionicons name="location-outline" size={14} color={colors.textLight} />
        <Text className="text-sm text-textLight ml-2">{activity.location}</Text>
      </View>
    </TouchableOpacity>
  );
};
