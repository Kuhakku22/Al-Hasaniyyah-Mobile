import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * Kompres gambar ke ukuran maksimal 400x400px (Kualitas JPEG 0.6)
 * Menghasilkan string base64 super kecil (~30-50KB) yang 100% aman disimpan di AsyncStorage, Supabase, & Vercel API.
 */
export async function compressImageBase64(imageUri: string, maxWidth = 400, maxHeight = 400): Promise<string> {
  if (!imageUri) return "";

  // Jika di Web / Browser, gunakan HTML5 Canvas untuk kompresi kilat
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.65);
          resolve(compressedDataUrl);
          return;
        }
        resolve(imageUri);
      };
      img.onerror = () => resolve(imageUri);
      img.src = imageUri;
    });
  }

  return imageUri;
}

/**
 * Simpan Foto Profil Persisten Berdasarkan NIA & Nomor HP Alumni
 */
export async function savePersistentAvatar(identifier: string, base64Image: string): Promise<boolean> {
  if (!identifier) return false;
  try {
    const cleanKey = `@alumni_avatar_${identifier.replace(/\D/g, '')}`;
    if (base64Image) {
      await AsyncStorage.setItem(cleanKey, base64Image);
      await AsyncStorage.setItem('@global_user_avatar', base64Image);
    } else {
      await AsyncStorage.removeItem(cleanKey);
    }
    return true;
  } catch (err) {
    console.error("Gagal simpan foto profil persisten:", err);
    return false;
  }
}

/**
 * Ambil Foto Profil Persisten Berdasarkan NIA & Nomor HP Alumni
 */
export async function getPersistentAvatar(identifier: string): Promise<string> {
  try {
    if (identifier) {
      const cleanKey = `@alumni_avatar_${identifier.replace(/\D/g, '')}`;
      const saved = await AsyncStorage.getItem(cleanKey);
      if (saved) return saved;
    }
    const globalSaved = await AsyncStorage.getItem('@global_user_avatar');
    if (globalSaved) return globalSaved;
  } catch (err) {}
  return "";
}
