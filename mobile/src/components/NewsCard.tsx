import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { News } from '../data/mockData';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

interface NewsCardProps {
  news: News;
  onPress: () => void;
  horizontal?: boolean;
}

export const NewsCard: React.FC<NewsCardProps> = ({ news, onPress, horizontal = false }) => {
  if (horizontal) {
    return (
      <TouchableOpacity 
        onPress={onPress}
        className="bg-white rounded-xl shadow-sm border border-border mr-4 overflow-hidden w-64"
      >
        <Image source={{ uri: news.image }} className="w-full h-32 bg-gray-200" />
        <View className="p-3">
          <Text className="text-xs font-semibold text-primary mb-1 uppercase">{news.category}</Text>
          <Text className="text-sm font-bold text-text mb-1" numberOfLines={2}>{news.title}</Text>
          <Text className="text-xs text-textLight">{news.date}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      onPress={onPress}
      className="flex-row bg-white p-3 mx-4 mb-3 rounded-xl shadow-sm border border-border items-center"
    >
      <Image source={{ uri: news.image }} className="w-20 h-20 rounded-lg mr-3 bg-gray-200" />
      <View className="flex-1">
        <Text className="text-xs font-semibold text-primary mb-1">{news.category}</Text>
        <Text className="text-sm font-bold text-text mb-1" numberOfLines={2}>{news.title}</Text>
        <View className="flex-row items-center">
          <Ionicons name="calendar-outline" size={12} color={colors.textLight} />
          <Text className="text-xs text-textLight ml-1">{news.date}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};
