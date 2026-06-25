const SIGN_URL = import.meta.env.VITE_CLOUDINARY_SIGN_URL

export function isCloudinaryConfigured() {
  return Boolean(SIGN_URL)
}

export async function uploadToCloudinary(file) {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary belum dikonfigurasi. Set VITE_CLOUDINARY_SIGN_URL di .env')
  }

  const signResponse = await fetch(SIGN_URL, { method: 'POST' })
  if (!signResponse.ok) {
    throw new Error('Gagal mendapatkan signature dari server')
  }
  const { signature, timestamp, folder, apiKey, cloudName } = await signResponse.json()

  const formData = new FormData()
  formData.append('file', file)
  formData.append('api_key', apiKey)
  formData.append('timestamp', timestamp)
  formData.append('signature', signature)
  formData.append('folder', folder)

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const detail = await response.json().catch(() => null)
    throw new Error(detail?.error?.message || 'Gagal mengunggah file ke Cloudinary')
  }

  const data = await response.json()
  const kind = file.type.startsWith('image/') ? 'image' : 'pdf'
  return { url: data.secure_url, fileName: file.name, kind }
}
