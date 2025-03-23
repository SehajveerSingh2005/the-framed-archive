// import * as admin from 'firebase-admin'
// import { getApps } from 'firebase-admin/app'

// if (!getApps().length) {
//   try {
//     admin.initializeApp({
//       credential: admin.credential.cert({
//         projectId: process.env.FIREBASE_PROJECT_ID,
//         clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
//         privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
//       })
//     })
//   } catch (error) {
//     console.error('Firebase admin initialization error:', error)
//   }
// }

// export const auth = admin.auth()

// export async function isAdminEmail(email: string) {
//   if (!email || !process.env.ADMIN_EMAIL) return false
//   return email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase()
// }