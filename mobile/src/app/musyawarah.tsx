import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function MusyawarahScreen() {
  const router = useRouter();
  const [polls, setPolls] = useState([
    { 
      id: 1, 
      question: "Lokasi Silaturahmi Akbar Nasional 2026?", 
      options: [
        { name: "Pondok Pesantren Dalwa Pasuruan", votes: 245 },
        { name: "Wilayah Jabodetabek (Jakarta)", votes: 120 },
        { name: "Wilayah Kalimantan (Pontianak)", votes: 68 }
      ], 
      voted: false 
    }
  ]);

  const handleVote = (pollId: number, optionIndex: number) => {
    setPolls(polls.map(p => {
      if (p.id === pollId && !p.voted) {
        const updatedOptions = [...p.options];
        updatedOptions[optionIndex].votes += 1;
        return { ...p, options: updatedOptions, voted: true };
      }
      return p;
    }));
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-900" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center p-4 border-b border-slate-800">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#94a3b8" />
        </TouchableOpacity>
        <Text className="text-white font-bold text-lg">Musyawarah & Polling</Text>
      </View>

      <ScrollView className="flex-1 p-4">
        {polls.map(p => {
          const totalVotes = p.options.reduce((sum, opt) => sum + opt.votes, 0);
          return (
            <View key={p.id} className="p-5 bg-slate-800/80 rounded-2xl border border-slate-700 mb-4">
              <Text className="font-bold text-base text-white mb-4">{p.question}</Text>
              <View className="space-y-3">
                {p.options.map((opt, oIdx) => {
                  const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                  return (
                    <TouchableOpacity
                      key={oIdx}
                      onPress={() => handleVote(p.id, oIdx)}
                      disabled={p.voted}
                      className={`w-full rounded-xl border overflow-hidden relative mb-3 ${p.voted ? 'border-slate-700 bg-slate-900' : 'border-slate-600 bg-slate-800'}`}
                    >
                      {/* Progress bar background */}
                      <View 
                        className="absolute top-0 left-0 bottom-0 bg-emerald-600/20" 
                        style={{ width: `${pct}%` }} 
                      />
                      
                      <View className="flex-row justify-between items-center p-4 relative z-10">
                        <Text className="font-medium text-slate-200 flex-1 pr-4">{opt.name}</Text>
                        <Text className="font-bold text-emerald-400 text-xs">{pct}% ({opt.votes})</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <Text className="text-[10px] text-slate-500 mt-2">Total partisipan: {totalVotes} alumni</Text>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
