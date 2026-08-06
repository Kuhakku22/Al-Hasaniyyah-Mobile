import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';

export default function ActivitiesScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'iuran' | 'kehadiran'>('iuran');
  const [refreshing, setRefreshing] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [iuranList, setIuranList] = useState<any[]>([]);
  const [kegiatanList, setKegiatanList] = useState<any[]>([]);

  const loadData = async () => {
    try {
      const storedProfile = await AsyncStorage.getItem('userProfile');
      let profile = null;
      if (storedProfile) {
        profile = JSON.parse(storedProfile);
        setUserProfile(profile);
      }

      // 1. Data Iuran Wajib Mock / Real
      if (profile && profile.id !== '00000000-0000-0000-0000-000000000000') {
        const { data: iuranData } = await supabase
          .from('iuran_wajib')
          .select('*')
          .eq('alumni_id', profile.id)
          .order('created_at', { ascending: false });

        if (iuranData && iuranData.length > 0) {
          setIuranList(iuranData);
        } else {
          setDefaultIuran();
        }
      } else {
        setDefaultIuran();
      }

      // 2. Data Kehadiran Acara / Kegiatan
      setDefaultKegiatan();
    } catch (e) {
      console.error(e);
      setDefaultIuran();
      setDefaultKegiatan();
    }
  };

  const setDefaultIuran = () => {
    setIuranList([
      { id: '1', periode: 'Agustus 2026', nominal: 20000, status: 'lunas', tgl: '01 Ags 2026' },
      { id: '2', periode: 'Juli 2026', nominal: 20000, status: 'lunas', tgl: '02 Jul 2026' },
      { id: '3', periode: 'Juni 2026', nominal: 20000, status: 'menunggak', tgl: 'Jatuh tempo 15 Jun' },
    ]);
  };

  const setDefaultKegiatan = () => {
    setKegiatanList([
      {
        id: 'k1',
        judul: 'Multaqo Alumni Nasional 2026',
        tanggal: '15 Agustus 2026',
        lokasi: 'Aula Utama Ponpes Dalwa',
        statusKehadiran: 'Hadir (Disetujui)',
        tipe: 'verified',
      },
      {
        id: 'k2',
        judul: 'Pengajian Rutin Kitab Al-Hikam Bulanan',
        tanggal: '06 Agustus 2026',
        lokasi: 'Masjid Jami Pasuruan',
        statusKehadiran: 'Hadir (Disetujui)',
        tipe: 'verified',
      },
      {
        id: 'k3',
        judul: 'Silaturahmi & Musyawarah Korda pasuruan',
        tanggal: '28 Agustus 2026',
        lokasi: 'Gedung Alumni Korda',
        statusKehadiran: 'Menunggu Konfirmasi',
        tipe: 'pending',
      },
    ]);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadData().finally(() => setRefreshing(false));
  }, []);

  const tunggakanCount = iuranList.filter(item => item.status === 'menunggak' || item.status === 'belum_bayar').length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Bar Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Aktifitas Saya</Text>
        <Text style={styles.headerSubtitle}>Status Iuran & Konfirmasi Kehadiran Acara</Text>
      </View>

      {/* Navigation Tab Switcher */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'iuran' && styles.tabButtonActive]}
          onPress={() => setActiveTab('iuran')}
        >
          <Ionicons 
            name="wallet-outline" 
            size={18} 
            color={activeTab === 'iuran' ? '#059669' : '#64748B'} 
          />
          <Text style={[styles.tabText, activeTab === 'iuran' && styles.tabTextActive]}>
            Status Iuran
          </Text>
          {tunggakanCount > 0 && (
            <View style={styles.badgeDanger}>
              <Text style={styles.badgeDangerText}>{tunggakanCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'kehadiran' && styles.tabButtonActive]}
          onPress={() => setActiveTab('kehadiran')}
        >
          <Ionicons 
            name="calendar-outline" 
            size={18} 
            color={activeTab === 'kehadiran' ? '#059669' : '#64748B'} 
          />
          <Text style={[styles.tabText, activeTab === 'kehadiran' && styles.tabTextActive]}>
            Kehadiran Acara
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#059669" />}
      >
        {activeTab === 'iuran' ? (
          <View style={styles.section}>
            {/* Card Summary Status */}
            <View style={[styles.summaryCard, tunggakanCount > 0 ? styles.summaryCardWarning : styles.summaryCardSuccess]}>
              <View style={styles.summaryCardHeader}>
                <Ionicons 
                  name={tunggakanCount > 0 ? "alert-circle" : "checkmark-circle"} 
                  size={24} 
                  color={tunggakanCount > 0 ? "#DC2626" : "#059669"} 
                />
                <Text style={styles.summaryCardTitle}>
                  {tunggakanCount > 0 ? 'Ada Tunggakan Iuran' : 'Status Iuran Bebas Tunggakan'}
                </Text>
              </View>
              <Text style={styles.summaryCardDesc}>
                {tunggakanCount > 0 
                  ? `Antum memiliki ${tunggakanCount} periode iuran wajib yang belum diselesaikan.`
                  : 'Jazakallahu khair, seluruh iuran wajib bulanan Antum telah terbayar lunas.'}
              </Text>
              {tunggakanCount > 0 && (
                <TouchableOpacity 
                  style={styles.payNowBtn}
                  onPress={() => router.push('/infak')}
                >
                  <Text style={styles.payNowBtnText}>Bayar Tunggakan Sekarang</Text>
                  <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              )}
            </View>

            {/* List Detail Periode Iuran */}
            <Text style={styles.sectionHeader}>Riwayat Periode Iuran Wajib</Text>
            {iuranList.map((item) => {
              const isLunas = item.status === 'lunas';
              return (
                <View key={item.id} style={styles.itemCard}>
                  <View style={styles.itemLeft}>
                    <View style={[styles.iconCircle, isLunas ? styles.iconCircleSuccess : styles.iconCircleDanger]}>
                      <Ionicons 
                        name={isLunas ? "checkmark" : "close"} 
                        size={20} 
                        color={isLunas ? "#059669" : "#DC2626"} 
                      />
                    </View>
                    <View>
                      <Text style={styles.itemTitle}>{item.periode}</Text>
                      <Text style={styles.itemSubtitle}>
                        Rp {item.nominal.toLocaleString('id-ID')} • {item.tgl || 'Periode Bulanan'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.itemRight}>
                    <View style={[styles.statusTag, isLunas ? styles.statusTagSuccess : styles.statusTagDanger]}>
                      <Text style={[styles.statusTagText, isLunas ? styles.statusTagTextSuccess : styles.statusTagTextDanger]}>
                        {isLunas ? 'LUNAS' : 'BELUM BAYAR'}
                      </Text>
                    </View>
                    {!isLunas && (
                      <TouchableOpacity 
                        style={styles.paySmallBtn}
                        onPress={() => router.push('/infak')}
                      >
                        <Text style={styles.paySmallBtnText}>Bayar</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.section}>
            {/* List Kehadiran Acara / Kegiatan Alumni */}
            <Text style={styles.sectionHeader}>Acara Yang Disetujui & Diikuti</Text>

            {kegiatanList.map((kegiatan) => (
              <View key={kegiatan.id} style={styles.kegiatanCard}>
                <View style={styles.kegiatanHeader}>
                  <View style={styles.kegiatanIconBg}>
                    <Ionicons name="calendar" size={22} color="#059669" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.kegiatanTitle}>{kegiatan.judul}</Text>
                    <View style={styles.rowInfo}>
                      <Ionicons name="time-outline" size={14} color="#64748B" />
                      <Text style={styles.kegiatanDetailText}>{kegiatan.tanggal}</Text>
                    </View>
                    <View style={styles.rowInfo}>
                      <Ionicons name="location-outline" size={14} color="#64748B" />
                      <Text style={styles.kegiatanDetailText}>{kegiatan.lokasi}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.kegiatanFooter}>
                  <Text style={styles.kegiatanStatusLabel}>Status Kehadiran:</Text>
                  <View style={[styles.statusTag, kegiatan.tipe === 'verified' ? styles.statusTagSuccess : styles.statusTagWarning]}>
                    <Text style={[styles.statusTagText, kegiatan.tipe === 'verified' ? styles.statusTagTextSuccess : styles.statusTagTextWarning]}>
                      {kegiatan.statusKehadiran}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#0F172A' },
  headerSubtitle: { fontSize: 13, color: '#64748B', marginTop: 2 },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    gap: 8,
  },
  tabButtonActive: { borderBottomColor: '#059669' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#64748B' },
  tabTextActive: { color: '#059669', fontWeight: '700' },
  badgeDanger: {
    backgroundColor: '#EF4444',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeDangerText: { color: '#FFFFFF', fontSize: 10, fontWeight: 'bold' },
  scrollContent: { padding: 16 },
  section: { gap: 16 },
  summaryCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
  },
  summaryCardSuccess: { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' },
  summaryCardWarning: { backgroundColor: '#FEF2F2', borderColor: '#FCA5A5' },
  summaryCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  summaryCardTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  summaryCardDesc: { fontSize: 13, color: '#475569', lineHeight: 18, marginBottom: 12 },
  payNowBtn: {
    backgroundColor: '#DC2626',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  payNowBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
  sectionHeader: { fontSize: 15, fontWeight: '700', color: '#334155', marginTop: 8 },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  itemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justify: 'center' },
  iconCircleSuccess: { backgroundColor: '#D1FAE5' },
  iconCircleDanger: { backgroundColor: '#FEE2E2' },
  itemTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  itemSubtitle: { fontSize: 12, color: '#64748B', marginTop: 2 },
  itemRight: { alignItems: 'flex-end', gap: 6 },
  statusTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusTagSuccess: { backgroundColor: '#D1FAE5' },
  statusTagDanger: { backgroundColor: '#FEE2E2' },
  statusTagWarning: { backgroundColor: '#FEF3C7' },
  statusTagText: { fontSize: 11, fontWeight: 'bold' },
  statusTagTextSuccess: { color: '#047857' },
  statusTagTextDanger: { color: '#B91C1C' },
  statusTagTextWarning: { color: '#B45309' },
  paySmallBtn: { backgroundColor: '#059669', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
  paySmallBtnText: { color: '#FFFFFF', fontSize: 11, fontWeight: 'bold' },
  kegiatanCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  kegiatanHeader: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  kegiatanIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kegiatanTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  rowInfo: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  kegiatanDetailText: { fontSize: 12, color: '#64748B' },
  kegiatanFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    pt: 10,
    paddingTop: 10,
  },
  kegiatanStatusLabel: { fontSize: 12, color: '#64748B', fontWeight: '500' },
});
