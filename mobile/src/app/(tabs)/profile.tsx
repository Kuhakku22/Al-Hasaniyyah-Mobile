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
  Switch,
  Linking,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';

// Safely load Expo ImagePicker to ensure zero build errors on Vercel / Web
let ImagePicker: any = null;
try {
  ImagePicker = require('expo-image-picker');
} catch (e) {}

export default function ProfileScreen() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Modals visibility
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showImagePickerModal, setShowImagePickerModal] = useState(false);

  // Edit Form State
  const [editData, setEditData] = useState({
    nama: '',
    phone: '',
    domisili: '',
    ttl: '',
    alamatKtp: '',
    pekerjaan: '',
    fotoProfil: '',
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
          fotoProfil: parsed.foto_profil || '',
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // Universal Image Picker (Supports HTML5 File Reader on Web + Expo ImagePicker on Mobile)
  const pickImageFromGallery = async () => {
    // 1. Browser Web HTML5 Native File Picker Fallback
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      try {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e: any) => {
          const file = e.target?.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              if (event.target?.result) {
                setEditData((prev) => ({ ...prev, fotoProfil: event.target!.result as string }));
                setShowImagePickerModal(false);
              }
            };
            reader.readAsDataURL(file);
          }
        };
        input.click();
        return;
      } catch (webErr) {}
    }

    // 2. Native Expo ImagePicker
    if (ImagePicker) {
      try {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Izin Ditolak', 'Mohon izinkan akses galeri foto untuk mengunggah foto profil.');
          return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.7,
          base64: true,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          const asset = result.assets[0];
          const imageUri = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
          setEditData((prev) => ({ ...prev, fotoProfil: imageUri }));
          setShowImagePickerModal(false);
        }
      } catch (e: any) {
        Alert.alert('Gagal Pilih Gambar', e.message || 'Terjadi kesalahan saat memilih gambar.');
      }
    }
  };

  // Capture Image from Camera
  const takePhotoWithCamera = async () => {
    if (ImagePicker) {
      try {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Izin Ditolak', 'Mohon izinkan akses kamera untuk mengambil foto profil.');
          return;
        }

        const result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.7,
          base64: true,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          const asset = result.assets[0];
          const imageUri = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
          setEditData((prev) => ({ ...prev, fotoProfil: imageUri }));
          setShowImagePickerModal(false);
        }
      } catch (e: any) {
        Alert.alert('Gagal Ambil Foto', e.message || 'Terjadi kesalahan saat mengambil foto.');
      }
    } else {
      pickImageFromGallery();
    }
  };

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
        foto_profil: editData.fotoProfil || userProfile?.foto_profil || '',
      };

      // Update Supabase if real user
      if (userProfile?.id && userProfile.id !== '00000000-0000-0000-0000-000000000000') {
        try {
          await supabase
            .from('alumni')
            .update({
              nama_lengkap: editData.nama.trim(),
              nomor_hp: editData.phone.trim(),
              alamat_domisili: editData.domisili.trim(),
              tempat_tanggal_lahir: editData.ttl.trim(),
              alamat_ktp: editData.alamatKtp.trim(),
              pekerjaan: editData.pekerjaan.trim(),
              foto_profil: editData.fotoProfil || userProfile?.foto_profil || '',
              updated_at: new Date().toISOString(),
            })
            .eq('id', userProfile.id);
        } catch (dbErr) {}
      }

      await AsyncStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      setUserProfile(updatedProfile);
      setShowEditModal(false);
      Alert.alert('Berhasil', 'Profil & Foto Anggota berhasil diperbarui!');
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

  // Open WhatsApp to official helpline number 082257003806
  const openOfficialWhatsApp = () => {
    const phone = "6282257003806";
    const text = encodeURIComponent("Assalamu'alaikum Pengurus Al-Hasaniyyah Pusat, mohon bantuan informasi/verifikasi akun alumni saya.");
    const url = `https://wa.me/${phone}?text=${text}`;
    Linking.openURL(url).catch(() => {
      Alert.alert("Info Pengurus WA", "Nomor WhatsApp Pengurus Pusat: 082257003806 (+62 822-5700-3806)");
    });
  };

  // Open Mail client to hsn.pusatdalwa@gmail.com
  const openOfficialEmail = () => {
    const email = "hsn.pusatdalwa@gmail.com";
    const subject = encodeURIComponent("Pertanyaan / Bantuan Alumni Al-Hasaniyyah");
    const url = `mailto:${email}?subject=${subject}`;
    Linking.openURL(url).catch(() => {
      Alert.alert("Info Email Resmi", "Email Resmi Pengurus: hsn.pusatdalwa@gmail.com");
    });
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
          <TouchableOpacity 
            style={styles.avatarContainer}
            onPress={() => setShowEditModal(true)}
            activeOpacity={0.8}
          >
            {userProfile?.foto_profil || editData.fotoProfil ? (
              <Image 
                source={{ uri: userProfile?.foto_profil || editData.fotoProfil }} 
                style={styles.avatarImage} 
              />
            ) : (
              <View style={styles.avatarWrapper}>
                <Text style={styles.avatarText}>
                  {getInitials(userProfile?.nama_lengkap || 'Ahmad Ali')}
                </Text>
              </View>
            )}
            <View style={styles.cameraIconBadge}>
              <Ionicons name="camera" size={14} color="#FFF" />
            </View>
          </TouchableOpacity>

          <Text style={styles.userName}>{userProfile?.nama_lengkap || 'Ahmad Ali'}</Text>
          <Text style={styles.userNia}>NIA: {userProfile?.nomor_id_unik || '3.35.1426.00007'}</Text>

          <View style={styles.badgeRow}>
            <View style={styles.tagBadge}>
              <Ionicons name="location" size={12} color="#059669" />
              <Text style={styles.tagBadgeText}>
                {userProfile?.alamat_domisili || 'Pasuruan'} • Angkatan {userProfile?.tahun_lulus || userProfile?.angkatan || 2025}
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
            <View style={{ flex: 1 }}>
              <Text style={styles.menuText}>Edit Profil & Foto</Text>
              <Text style={styles.menuSubText}>Ubah foto profil, nama, & alamat domisili</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>

          {/* 2. Kartu Anggota Virtual */}
          <TouchableOpacity style={styles.menuItem} onPress={() => setShowCardModal(true)}>
            <View style={[styles.menuIconBg, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="card" size={20} color="#059669" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuText}>Kartu Anggota Virtual (KTA)</Text>
              <Text style={styles.menuSubText}>Tampilkan KTA Digital resmi alumni</Text>
            </View>
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
            <View style={{ flex: 1 }}>
              <Text style={styles.menuText}>Pusat Bantuan & Pengurus</Text>
              <Text style={styles.menuSubText}>Kontak WA: 082257003806 & Email Resmi</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Tombol Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#DC2626" />
          <Text style={styles.logoutBtnText}>Keluar Akun</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Aplikasi Alumni Al-Hasaniyyah v1.3.0</Text>
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

            <ScrollView style={{ maxHeight: 440 }} showsVerticalScrollIndicator={false}>
              {/* Photo Input Area */}
              <View style={styles.photoUploadContainer}>
                <View style={styles.previewAvatarBox}>
                  {editData.fotoProfil ? (
                    <Image source={{ uri: editData.fotoProfil }} style={styles.previewAvatarImage} />
                  ) : userProfile?.foto_profil ? (
                    <Image source={{ uri: userProfile.foto_profil }} style={styles.previewAvatarImage} />
                  ) : (
                    <View style={styles.previewAvatarPlaceholder}>
                      <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 24 }}>
                        {getInitials(editData.nama || 'Ahmad Ali')}
                      </Text>
                    </View>
                  )}
                </View>

                <TouchableOpacity 
                  style={styles.choosePhotoBtn}
                  onPress={() => setShowImagePickerModal(true)}
                >
                  <Ionicons name="camera" size={16} color="#059669" />
                  <Text style={styles.choosePhotoBtnText}>Ganti Foto Profil</Text>
                </TouchableOpacity>
              </View>

              {/* Direct Photo URL Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>URL Foto Profil (Opsional)</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="https://example.com/foto.jpg atau biarkan kosong"
                  placeholderTextColor="#94A3B8"
                  value={editData.fotoProfil.startsWith('data:') ? '[Foto Berhasil Diunggah]' : editData.fotoProfil}
                  onChangeText={(t) => setEditData({ ...editData, fotoProfil: t })}
                />
              </View>

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
                <Text style={styles.saveBtnText}>Simpan Perubahan Profil</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ==================== MODAL SELECTION: OPSI PILIH GAMBAR ==================== */}
      <Modal visible={showImagePickerModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { padding: 24 }]}>
            <Text style={{ fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 16, textAlign: 'center' }}>
              Pilih Sumber Foto Profil
            </Text>

            <TouchableOpacity 
              style={styles.imagePickerOption}
              onPress={pickImageFromGallery}
            >
              <View style={[styles.pickerIconBg, { backgroundColor: '#ECFDF5' }]}>
                <Ionicons name="images" size={22} color="#059669" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.pickerOptionTitle}>Pilih dari Galeri Foto</Text>
                <Text style={styles.pickerOptionSub}>Ambil foto yang sudah tersimpan di HP / Komputer</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.imagePickerOption}
              onPress={takePhotoWithCamera}
            >
              <View style={[styles.pickerIconBg, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="camera" size={22} color="#2563EB" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.pickerOptionTitle}>Ambil Foto dengan Kamera</Text>
                <Text style={styles.pickerOptionSub}>Foto langsung menggunakan kamera HP</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.closeCardBtn, { backgroundColor: '#F1F5F9', marginTop: 12 }]}
              onPress={() => setShowImagePickerModal(false)}
            >
              <Text style={{ color: '#475569', fontWeight: 'bold', fontSize: 14 }}>Batal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ==================== MODAL 2: KARTU ANGGOTA VIRTUAL (KTA DIGITAL) ==================== */}
      <Modal visible={showCardModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: '#064E3B', padding: 20 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 16 }}>Kartu Anggota Digital (KTA)</Text>
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
                <Text style={{ color: '#FCD34D', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 }}>OFFICIAL MEMBER</Text>
              </View>

              <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center', marginBottom: 16 }}>
                {userProfile?.foto_profil || editData.fotoProfil ? (
                  <Image 
                    source={{ uri: userProfile?.foto_profil || editData.fotoProfil }} 
                    style={styles.idAvatarImage} 
                  />
                ) : (
                  <View style={styles.idAvatar}>
                    <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 20 }}>
                      {getInitials(userProfile?.nama_lengkap || 'Ahmad Ali')}
                    </Text>
                  </View>
                )}

                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#F8FAFC', fontWeight: '800', fontSize: 16, marginBottom: 2 }}>
                    {userProfile?.nama_lengkap || 'Ahmad Ali'}
                  </Text>
                  <Text style={{ color: '#FCD34D', fontWeight: 'bold', fontSize: 13, marginBottom: 4 }}>
                    NIA: {userProfile?.nomor_id_unik || '3.35.1426.00007'}
                  </Text>
                  <Text style={{ color: '#D1FAE5', fontSize: 11 }}>
                    Domisili: {userProfile?.alamat_domisili || 'Pasuruan'}
                  </Text>
                </View>
              </View>

              {/* Barcode Visual & Official Tag */}
              <View style={{ borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)', paddingTop: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text style={{ color: '#D1FAE5', fontSize: 10, fontWeight: 'bold' }}>Pondok Pesantren Dalwa</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 8, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }}>
                    ID: {userProfile?.nomor_id_unik || '3.35.1426.00007'}
                  </Text>
                </View>

                <View style={{ backgroundColor: '#10B981', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                  <Text style={{ color: '#FFF', fontSize: 10, fontWeight: 'bold' }}>✓ VERIFIED</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.closeCardBtn}
              onPress={() => {
                Alert.alert('Info Kartu KTA', 'Kartu Anggota Virtual resmi siap digunakan untuk identitas alumni Al-Hasaniyyah.');
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

      {/* ==================== MODAL 4: PUSAT BANTUAN & PENGURUS ==================== */}
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
              Jika Antum memiliki kendala aplikasi, verifikasi akun, atau pertanyaan terkait iuran alumni, silakan hubungi pengurus resmi pusat:
            </Text>

            {/* Contact 1: WhatsApp Pengurus 082257003806 */}
            <TouchableOpacity style={styles.contactBox} onPress={openOfficialWhatsApp}>
              <Ionicons name="logo-whatsapp" size={26} color="#25D366" />
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: 'bold', color: '#0F172A', fontSize: 14 }}>WhatsApp Pengurus Pusat</Text>
                <Text style={{ color: '#059669', fontWeight: 'bold', fontSize: 13 }}>082257003806 (+62 822-5700-3806)</Text>
              </View>
              <Ionicons name="open-outline" size={18} color="#059669" />
            </TouchableOpacity>

            {/* Contact 2: Email Resmi hsn.pusatdalwa@gmail.com */}
            <TouchableOpacity style={styles.contactBox} onPress={openOfficialEmail}>
              <Ionicons name="mail" size={26} color="#2563EB" />
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: 'bold', color: '#0F172A', fontSize: 14 }}>Email Resmi Pengurus</Text>
                <Text style={{ color: '#2563EB', fontWeight: 'bold', fontSize: 13 }}>hsn.pusatdalwa@gmail.com</Text>
              </View>
              <Ionicons name="open-outline" size={18} color="#2563EB" />
            </TouchableOpacity>

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
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarWrapper: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#A7F3D0',
  },
  avatarImage: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 3,
    borderColor: '#F59E0B',
  },
  cameraIconBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#059669',
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
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
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12,
  },
  menuIconBg: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  menuSubText: { fontSize: 11, color: '#64748B', marginTop: 1 },
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
  photoUploadContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  previewAvatarBox: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 10,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#059669',
  },
  previewAvatarImage: {
    width: '100%',
    height: '100%',
  },
  previewAvatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },
  choosePhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  choosePhotoBtnText: { color: '#047857', fontSize: 12, fontWeight: 'bold' },
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
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FCD34D',
  },
  idAvatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
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
    padding: 14,
    borderRadius: 14,
    gap: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  imagePickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderRadius: 14,
    gap: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pickerIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerOptionTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  pickerOptionSub: { fontSize: 11, color: '#64748B', marginTop: 2 },
});
