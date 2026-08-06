import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Alert, 
  Modal, 
  TextInput, 
  ActivityIndicator,
  StyleSheet,
  Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';

export default function ProfileScreen() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Modals visibility
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Edit Form State
  const [editData, setEditData] = useState({
    nama: '',
    phone: '',
    domisili: '',
    ttl: '',
    alamatKtp: '',
    pekerjaan: '',
  });

  // Settings State
  const [notifApp, setNotifApp] = useState(true);
  const [notifWa, setNotifWa] = useState(true);

  const loadProfile = async () => {
    try {
      const storedProfile = await AsyncStorage.getItem('userProfile');
      if (storedProfile) {
        const parsed = JSON.parse(storedProfile);
        setUserProfile(parsed);
        setEditData({
          nama: parsed.nama_lengkap || '',
          phone: parsed.nomor_hp || '',
          domisili: parsed.alamat_domisili || '',
          ttl: parsed.tempat_tanggal_lahir || '',
          alamatKtp: parsed.alamat_ktp || '',
          pekerjaan: parsed.pekerjaan || '',
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSaveProfile = async () => {
    if (!editData.nama.trim() || !editData.phone.trim()) {
      Alert.alert('Error', 'Nama Lengkap dan Nomor WhatsApp tidak boleh kosong.');
      return;
    }

    setLoading(true);
    try {
      const updatedProfile = {
        ...userProfile,
        nama_lengkap: editData.nama.trim(),
        nomor_hp: editData.phone.trim(),
        alamat_domisili: editData.domisili.trim(),
        tempat_tanggal_lahir: editData.ttl.trim(),
        alamat_ktp: editData.alamatKtp.trim(),
        pekerjaan: editData.pekerjaan.trim(),
      };

      // Update Supabase if real user
      if (userProfile?.id && userProfile.id !== '00000000-0000-0000-0000-000000000000') {
        const { error } = await supabase
          .from('alumni')
          .update({
            nama_lengkap: editData.nama.trim(),
            nomor_hp: editData.phone.trim(),
            alamat_domisili: editData.domisili.trim(),
            tempat_tanggal_lahir: editData.ttl.trim(),
            alamat_ktp: editData.alamatKtp.trim(),
            pekerjaan: editData.pekerjaan.trim(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', userProfile.id);

        if (error) throw error;
      }

      await AsyncStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      setUserProfile(updatedProfile);
      setShowEditModal(false);
      Alert.alert('Berhasil', 'Profil Anda berhasil diperbarui!');
    } catch (e: any) {
      Alert.alert('Gagal Simpan', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Keluar Aplikasi', 'Apakah Antum yakin ingin keluar dari akun ini?', [
      { text: 'Batal', style: 'cancel' },
      { 
        text: 'Ya, Keluar', 
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('userToken');
          await AsyncStorage.removeItem('userProfile');
          router.replace('/');
        }
      }
    ]);
  };

  const getInitials = (name: string) => {
    if (!name) return 'AL';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header Bar */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profil Saya</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Avatar & Info Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrapper}>
            <Text style={styles.avatarText}>
              {getInitials(userProfile?.nama_lengkap || 'Ahmad Ali')}
            </Text>
          </View>
          <Text style={styles.userName}>{userProfile?.nama_lengkap || 'Ahmad Fadillah'}</Text>
          <Text style={styles.userNia}>NIA: {userProfile?.nomor_id_unik || '123456'}</Text>

          <View style={styles.badgeRow}>
            <View style={styles.tagBadge}>
              <Ionicons name="location" size={12} color="#059669" />
              <Text style={styles.tagBadgeText}>
                {userProfile?.alamat_domisili || 'Pasuruan'} • Angkatan {userProfile?.tahun_lulus || userProfile?.angkatan || 2020}
              </Text>
            </View>
          </View>
        </View>

        {/* List Menu Item */}
        <View style={styles.menuContainer}>
          {/* 1. Edit Profil */}
          <TouchableOpacity style={styles.menuItem} onPress={() => setShowEditModal(true)}>
            <View style={[styles.menuIconBg, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="person" size={20} color="#2563EB" />
            </View>
            <Text style={styles.menuText}>Edit Profil</Text>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>

          {/* 2. Kartu Anggota Virtual */}
          <TouchableOpacity style={styles.menuItem} onPress={() => setShowCardModal(true)}>
            <View style={[styles.menuIconBg, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="card" size={20} color="#059669" />
            </View>
            <Text style={styles.menuText}>Kartu Anggota Virtual</Text>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>

          {/* 3. Riwayat Aktivitas */}
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(tabs)/activities')}>
            <View style={[styles.menuIconBg, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="time" size={20} color="#D97706" />
            </View>
            <Text style={styles.menuText}>Riwayat Aktivitas & Iuran</Text>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>

          {/* 4. Pengaturan */}
          <TouchableOpacity style={styles.menuItem} onPress={() => setShowSettingsModal(true)}>
            <View style={[styles.menuIconBg, { backgroundColor: '#F3E8FF' }]}>
              <Ionicons name="settings" size={20} color="#9333EA" />
            </View>
            <Text style={styles.menuText}>Pengaturan Aplikasi</Text>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>

          {/* 5. Pusat Bantuan */}
          <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]} onPress={() => setShowHelpModal(true)}>
            <View style={[styles.menuIconBg, { backgroundColor: '#FFEDD5' }]}>
              <Ionicons name="help-buoy" size={20} color="#EA580C" />
            </View>
            <Text style={styles.menuText}>Pusat Bantuan & Pengurus</Text>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Tombol Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#DC2626" />
          <Text style={styles.logoutBtnText}>Keluar Akun</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Aplikasi Alumni Al-Hasaniyyah v1.2.0</Text>
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ==================== MODAL 1: EDIT PROFIL ==================== */}
      <Modal visible={showEditModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profil Alumni</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nama Lengkap</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editData.nama}
                  onChangeText={(t) => setEditData({ ...editData, nama: t })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nomor WhatsApp</Text>
                <TextInput
                  style={styles.modalInput}
                  keyboardType="phone-pad"
                  value={editData.phone}
                  onChangeText={(t) => setEditData({ ...editData, phone: t })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Domisili Saat Ini</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editData.domisili}
                  onChangeText={(t) => setEditData({ ...editData, domisili: t })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Tempat Tanggal Lahir</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editData.ttl}
                  onChangeText={(t) => setEditData({ ...editData, ttl: t })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Alamat KTP</Text>
                <TextInput
                  style={styles.modalInput}
                  multiline
                  value={editData.alamatKtp}
                  onChangeText={(t) => setEditData({ ...editData, alamatKtp: t })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Pekerjaan / Bidang Usaha</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editData.pekerjaan}
                  onChangeText={(t) => setEditData({ ...editData, pekerjaan: t })}
                />
              </View>
            </ScrollView>

            <TouchableOpacity
              style={[styles.saveBtn, loading && { opacity: 0.7 }]}
              onPress={handleSaveProfile}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.saveBtnText}>Simpan Perubahan</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ==================== MODAL 2: KARTU ANGGOTA VIRTUAL ==================== */}
      <Modal visible={showCardModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: '#064E3B', padding: 20 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 16 }}>Kartu Anggota Digital</Text>
              <TouchableOpacity onPress={() => setShowCardModal(false)}>
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>

            {/* ID Card Visual */}
            <View style={styles.idCardVisual}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="school" size={24} color="#F59E0B" />
                  <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 16 }}>AL-HASANIYYAH</Text>
                </View>
                <Text style={{ color: '#A7F3D0', fontSize: 10, fontWeight: 'bold' }}>OFFICIAL MEMBER</Text>
              </View>

              <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center', marginBottom: 16 }}>
                <View style={styles.idAvatar}>
                  <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 20 }}>
                    {getInitials(userProfile?.nama_lengkap || 'Ahmad Ali')}
                  </Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#F8FAFC', fontWeight: '800', fontSize: 16, marginBottom: 2 }}>
                    {userProfile?.nama_lengkap || 'Ahmad Fadillah'}
                  </Text>
                  <Text style={{ color: '#FCD34D', fontWeight: 'bold', fontSize: 13, marginBottom: 4 }}>
                    NIA: {userProfile?.nomor_id_unik || '123456'}
                  </Text>
                  <Text style={{ color: '#D1FAE5', fontSize: 11 }}>
                    Domisili: {userProfile?.alamat_domisili || 'Pasuruan'}
                  </Text>
                </View>
              </View>

              <View style={{ borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)', paddingTop: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: '#D1FAE5', fontSize: 10 }}>Pondok Pesantren Dalwa</Text>
                <View style={{ backgroundColor: '#10B981', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
                  <Text style={{ color: '#FFF', fontSize: 9, fontWeight: 'bold' }}>VERIFIED</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.closeCardBtn}
              onPress={() => {
                Alert.alert('Info', 'Kartu Anggota Virtual siap digunakan untuk verifikasi alumni.');
                setShowCardModal(false);
              }}
            >
              <Text style={{ color: '#064E3B', fontWeight: 'bold', fontSize: 14 }}>Tutup Kartu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ==================== MODAL 3: PENGATURAN ==================== */}
      <Modal visible={showSettingsModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pengaturan Aplikasi</Text>
              <TouchableOpacity onPress={() => setShowSettingsModal(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.settingRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.settingLabel}>Notifikasi Aplikasi</Text>
                <Text style={styles.settingSub}>Terima info berita & kegiatan terbaru</Text>
              </View>
              <Switch value={notifApp} onValueChange={setNotifApp} trackColor={{ false: '#CBD5E1', true: '#10B981' }} />
            </View>

            <View style={styles.settingRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.settingLabel}>Notifikasi WhatsApp</Text>
                <Text style={styles.settingSub}>Kirim pengingat iuran via WA</Text>
              </View>
              <Switch value={notifWa} onValueChange={setNotifWa} trackColor={{ false: '#CBD5E1', true: '#10B981' }} />
            </View>

            <TouchableOpacity
              style={styles.saveBtn}
              onPress={() => {
                Alert.alert('Sukses', 'Pengaturan berhasil disimpan.');
                setShowSettingsModal(false);
              }}
            >
              <Text style={styles.saveBtnText}>Simpan Pengaturan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ==================== MODAL 4: PUSAT BANTUAN ==================== */}
      <Modal visible={showHelpModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pusat Bantuan & Pengurus</Text>
              <TouchableOpacity onPress={() => setShowHelpModal(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 13, color: '#475569', lineHeight: 20, marginBottom: 16 }}>
              Jika Antum memiliki kendala aplikasi, verifikasi akun, atau pertanyaan terkait iuran alumni, silakan hubungi pengurus resmi kami:
            </Text>

            <View style={styles.contactBox}>
              <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
              <View>
                <Text style={{ fontWeight: 'bold', color: '#0F172A', fontSize: 14 }}>WhatsApp Pengurus</Text>
                <Text style={{ color: '#64748B', fontSize: 12 }}>+62 812-3456-7890 (Sekretariat)</Text>
              </View>
            </View>

            <View style={styles.contactBox}>
              <Ionicons name="mail" size={24} color="#2563EB" />
              <View>
                <Text style={{ fontWeight: 'bold', color: '#0F172A', fontSize: 14 }}>Email Resmi</Text>
                <Text style={{ color: '#64748B', fontSize: 12 }}>admin@alhasaniyyah.org</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: '#059669', marginTop: 12 }]}
              onPress={() => setShowHelpModal(false)}
            >
              <Text style={styles.saveBtnText}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  scrollContent: { padding: 16 },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
  },
  avatarWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 3,
    borderColor: '#A7F3D0',
  },
  avatarText: { color: '#FFFFFF', fontSize: 28, fontWeight: 'bold' },
  userName: { fontSize: 18, fontWeight: '800', color: '#0F172A', marginBottom: 4 },
  userNia: { fontSize: 13, color: '#D97706', fontWeight: '700', marginBottom: 10 },
  badgeRow: { flexDirection: 'row', gap: 8 },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  tagBadgeText: { color: '#047857', fontSize: 11, fontWeight: 'bold' },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12,
  },
  menuIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: { flex: 1, fontSize: 14, fontWeight: '600', color: '#1E293B' },
  logoutBtn: {
    backgroundColor: '#FEE2E2',
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  logoutBtnText: { color: '#DC2626', fontWeight: 'bold', fontSize: 15 },
  versionText: { textAlign: 'center', fontSize: 12, color: '#94A3B8' },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  inputGroup: { marginBottom: 12 },
  inputLabel: { fontSize: 12, fontWeight: '600', color: '#475569', marginBottom: 4 },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  saveBtn: {
    backgroundColor: '#059669',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  saveBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
  idCardVisual: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 16,
  },
  idAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FCD34D',
  },
  closeCardBtn: {
    backgroundColor: '#FCD34D',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  settingLabel: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  settingSub: { fontSize: 12, color: '#64748B' },
  contactBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    gap: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
});
