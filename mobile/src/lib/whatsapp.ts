import { Linking } from 'react-native';

/**
 * Format nomor HP ke format internasional WhatsApp (0812... -> 62812...)
 */
export function formatPhoneNumberForWA(phone: string): string {
  if (!phone) return "";
  let cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.substring(1);
  } else if (!cleaned.startsWith("62")) {
    cleaned = "62" + cleaned;
  }
  return cleaned;
}

/**
 * Membuat pesan template resmi WhatsApp untuk pemberitahuan NIA Alumni
 */
export function createWAKonfirmasiTemplate(params: {
  nama: string;
  nia: string;
  statusText?: string;
}): string {
  const { nama, nia, statusText = "Alumni" } = params;

  return `*Assalamu'alaikum Wr. Wb.*

Yth. Akhi/Ukhti *${nama.trim()}* (${statusText}),

Selamat! Pendaftaran keanggotaan *Ikatan Alumni Al Hasaniyyah Dalwa* Anda telah berhasil terverifikasi.

Berikut adalah *Nomor Induk Anggota (NIA)* Resmi Anda:
🆔 *NIA: ${nia}*

Gunakan *Nama Lengkap* dan *Nomor NIA* di atas untuk masuk (login) ke *Aplikasi Mobile Al Hasaniyyah*.

Jazaakumullah Khairan Katsiran.
*Wassalamu'alaikum Wr. Wb.*

_Pengurus Pusat Ikatan Alumni Al Hasaniyyah Dalwa_`;
}

/**
 * Membuka aplikasi WhatsApp di HP dengan pesan otomatis
 */
export async function openWhatsAppMessageMobile(params: {
  phone: string;
  nama: string;
  nia: string;
  statusText?: string;
}) {
  const formattedPhone = formatPhoneNumberForWA(params.phone);
  if (!formattedPhone) return;

  const message = createWAKonfirmasiTemplate({
    nama: params.nama,
    nia: params.nia,
    statusText: params.statusText,
  });

  const encodedMessage = encodeURIComponent(message);
  const waUrl = `whatsapp://send?phone=${formattedPhone}&text=${encodedMessage}`;
  const fallbackUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;

  try {
    const supported = await Linking.canOpenURL(waUrl);
    if (supported) {
      await Linking.openURL(waUrl);
    } else {
      await Linking.openURL(fallbackUrl);
    }
  } catch (e) {
    await Linking.openURL(fallbackUrl);
  }
}
