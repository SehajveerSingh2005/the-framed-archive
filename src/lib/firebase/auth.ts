import { auth } from './config'
import { sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink, updateProfile, signOut } from 'firebase/auth'

export const sendMagicLink = async (email: string, name: string) => {
  const actionCodeSettings = {
    url: `${window.location.origin}/auth/verify?name=${encodeURIComponent(name)}`,
    handleCodeInApp: true
  }

  await sendSignInLinkToEmail(auth, email, actionCodeSettings)
  // Save email for verification
  localStorage.setItem('emailForSignIn', email)
  localStorage.setItem('nameForSignIn', name)
}

export const verifyMagicLink = async () => {
  if (!isSignInWithEmailLink(auth, window.location.href)) {
    throw new Error('Invalid magic link')
  }

  const email = localStorage.getItem('emailForSignIn')
  const name = localStorage.getItem('nameForSignIn')
  
  if (!email || !name) {
    throw new Error('No email found')
  }

  try {
    // First check if this link has already been used
    const linkUsed = sessionStorage.getItem('linkUsed')
    if (linkUsed === window.location.href) {
      throw new Error('This link has already been used')
    }

    const result = await signInWithEmailLink(auth, email, window.location.href)
    
    // Mark this link as used
    sessionStorage.setItem('linkUsed', window.location.href)
    
    await updateProfile(result.user, { displayName: name })
    
    localStorage.removeItem('emailForSignIn')
    localStorage.removeItem('nameForSignIn')
    
    return result.user
  } catch (error: any) {
    if (error.message === 'This link has already been used') {
      throw error
    }
    console.error('Magic link verification error:', error)
    throw error
  }
}

export const signOutUser = async () => {
  await signOut(auth)
  // Clear all auth-related items from localStorage
  localStorage.removeItem('emailForSignIn')
  localStorage.removeItem('nameForSignIn')
  localStorage.removeItem('authUser')
}