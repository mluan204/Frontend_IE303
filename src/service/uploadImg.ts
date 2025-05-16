// src/utils/uploadImage.js
import { supabase } from './supabaseClient'

export const uploadImage = async (file, bucket = 'images') => {
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}.${fileExt}`
  const filePath = `uploads/${fileName}`

  const { error } = await supabase
    .storage
    .from(bucket)
    .upload(filePath, file)

  if (error) {
    console.error('Upload error:', error)
    return null
  }

  const { data } = supabase
    .storage
    .from(bucket)
    .getPublicUrl(filePath)

  return data.publicUrl
}
