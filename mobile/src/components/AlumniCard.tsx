import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Alumni } from '../data/mockData';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

interface AlumniCardProps {
  alumni: Alumni;
  onPress: () => void;
}

export const AlumniCard: React.FC<AlumniCardProps> = ({ alumni, onPress }) => {
  return (
    <TouchableOpacity 
      onPress={onPress}
      className="flex-row bg-white p-4 mx-4 mb-3 rounded-xl shadow-sm border border-border items-center"
    >
      <Image 
        source={{ uri: alumni.avatar }} 
        className="w-14 h-14 rounded-full mr-4 bg-gray-200"
      />
      <View className="flex-1">
        <Text className="text-base font-bold text-text">{alumni.name}</Text>
        <Text className="text-sm text-textLight">{alumni.job}</Text>
        <View className="flex-row items-center mt-1">
          <Ionicons name="location-outline" size={14} color={colors.textLight} />
          <Text className="text-xs text-textLight ml-1">Korda {alumni.korda} • Angkatan {alumni.batch}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.border} />
    </TouchableOpacity>
  );
};
