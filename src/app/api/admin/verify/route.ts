// import { NextResponse } from 'next/server'
// import { auth, isAdminEmail } from '@/lib/firebase/admin'

// export async function POST(request: Request) {
//   try {
//     const { email } = await request.json()
//     const adminEmail = process.env.ADMIN_EMAIL

//     if (!adminEmail || email !== adminEmail) {
//       return NextResponse.json({ isAdmin: false })  // Remove the 403 status
//     }

//     const user = await auth.getUserByEmail(email)
//     await auth.setCustomUserClaims(user.uid, { admin: true })

//     return NextResponse.json({ isAdmin: true })
//   } catch (error) {
//     console.error('Admin verification error:', error)
//     return NextResponse.json({ isAdmin: false })  // Return false instead of error
//   }
// }