import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';

export default function MusyawarahScreen() {
  const router = useRouter();
  const [alumniId, setAlumniId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [polls, setPolls] = useState<any[]>([]);

  const loadSessionAndPolls = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('userToken');
      setAlumniId(storedToken);
      await fetchPolls(storedToken);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const fetchPolls = async (currentAlumniId: string | null) => {
    try {
      setLoading(true);
      const { data: questions, error: qError } = await supabase
        .from('polling_questions')
        .select('*')
        .eq('is_active', true);

      if (qError) throw qError;

      if (!questions || questions.length === 0) {
        // Fallback to mock data if table is empty or has error
        setPolls([
          { 
            id: 'mock-1', 
            question: "Lokasi Silaturahmi Akbar Nasional 2026?", 
            options: [
              { id: 'opt-1', name: "Pondok Pesantren Dalwa Pasuruan", votes: 245 },
              { id: 'opt-2', name: "Wilayah Jabodetabek (Jakarta)", votes: 120 },
              { id: 'opt-3', name: "Wilayah Kalimantan (Pontianak)", votes: 68 }
            ], 
            voted: false 
          }
        ]);
        return;
      }

      // Fetch options and votes for each question
      const loadedPolls = await Promise.all(questions.map(async (q) => {
        const { data: options, error: oError } = await supabase
          .from('polling_options')
          .select('*')
          .eq('question_id', q.id);

        if (oError) throw oError;

        const { data: votes, error: vError } = await supabase
          .from('polling_votes')
          .select('*')
          .eq('question_id', q.id);

        if (vError) throw vError;

        const totalVotes = votes || [];
        const hasVoted = currentAlumniId ? totalVotes.some(v => v.alumni_id === currentAlumniId) : false;

        const formattedOptions = (options || []).map(opt => {
          const voteCount = totalVotes.filter(v => v.option_id === opt.id).length;
          return {
            id: opt.id,
            name: opt.pilihan_teks,
            votes: voteCount
          };
        });

        return {
          id: q.id,
          question: q.pertanyaan,
          options: formattedOptions,
          voted: hasVoted
        };
      }));

      setPolls(loadedPolls);
    } catch (e: any) {
      console.error("Error fetching polls:", e.message);
      // Fallback on error
      setPolls([
        { 
          id: 'mock-1', 
          question: "Lokasi Silaturahmi Akbar Nasional 2026?", 
          options: [
            { id: 'opt-1', name: "Pondok Pesantren Dalwa Pasuruan", votes: 245 },
            { id: 'opt-2', name: "Wilayah Jabodetabek (Jakarta)", votes: 120 },
            { id: 'opt-3', name: "Wilayah Kalimantan (Pontianak)", votes: 68 }
          ], 
          voted: false 
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessionAndPolls();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleVote = async (questionId: string, optionId: string) => {
    if (!alumniId) {
      alert("Harap login terlebih dahulu untuk memberikan suara.");
      return;
    }

    // Uji coba bypass untuk mock user
    if (alumniId === '00000000-0000-0000-0000-000000000000' || questionId.startsWith('mock-')) {
      alert("Mode Uji Coba: Pilihan Anda telah dicatat (simulasi).");
      setPolls(polls.map(p => {
        if (p.id === questionId) {
          const updatedOptions = p.options.map((opt: any) => opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt);
          return { ...p, options: updatedOptions, voted: true };
        }
        return p;
      }));
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('polling_votes')
        .insert([{
          question_id: questionId,
          option_id: optionId,
          alumni_id: alumniId
        }]);

      if (error) {
        throw error;
      }

      await fetchPolls(alumniId);
    } catch (e: any) {
      alert("Gagal mengirim pilihan: " + e.message);
      setLoading(false);
    }
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
        {loading && polls.length === 0 ? (
          <View className="items-center py-20">
            <ActivityIndicator size="large" color="#10b981" />
            <Text className="text-slate-500 mt-4">Memuat data musyawarah...</Text>
          </View>
        ) : (
          polls.map(p => {
            const totalVotes = p.options.reduce((sum: number, opt: any) => sum + opt.votes, 0);
            return (
              <View key={p.id} className="p-5 bg-slate-800/80 rounded-2xl border border-slate-700 mb-4">
                <Text className="font-bold text-base text-white mb-4">{p.question}</Text>
                <View className="space-y-3">
                  {p.options.map((opt: any) => {
                    const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                    return (
                      <TouchableOpacity
                        key={opt.id}
                        onPress={() => handleVote(p.id, opt.id)}
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
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
