import { db } from './config'
import { collection, query, where, getDocs } from 'firebase/firestore'

export async function getProduct(slug: string) {
  const productsRef = collection(db, 'products')
  const q = query(productsRef, where('slug', '==', slug))
  const querySnapshot = await getDocs(q)
  
  if (querySnapshot.empty) {
    return null
  }

  const productData = querySnapshot.docs[0].data()
  return {
    id: querySnapshot.docs[0].id,
    ...productData,
    details: productData.details || [
      'Poster Print: Premium 300 GSM Matte Paper',
      'Canvas Print: 380 GSM Cotton Canvas',
      'Archival Quality Pigment-Based Inks',
      'UV-Resistant Coating',
      'Color-Calibrated Production',
      'Quality Checked Before Shipping'
    ]
  }
}