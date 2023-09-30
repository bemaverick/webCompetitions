import React, { useContext, useState, useEffect } from "react"
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, signOut } from "firebase/auth";
import { firebaseApp } from "../firebase"
import { CircularProgress } from '@mui/material';
import { useNavigate } from "react-router-dom";

const auth = getAuth(firebaseApp);


const AuthContext = React.createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  function signup(email, password) {
    return createUserWithEmailAndPassword(auth, email, password)
  }

  function signInWithEmail(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    return signOut(auth);
  }

  function updateUserProfile({ displayName, photoURL }) {
    const user = auth.currentUser;
    return updateProfile(user, { displayName, photoURL })
  }

  function resetPassword(email) {
    return auth.sendPasswordResetEmail(email)
  }

  function updateEmail(email) {
    return user.updateEmail(email)
  }

  function updatePassword(password) {
    return user.updatePassword(password)
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setUser(user);
      console.log(user);
      setLoading(false)
    })

    return unsubscribe;
  }, [])

  const value = {
    user,
    signInWithEmail,
    signup,
    logout,
    resetPassword,
    updateEmail,
    updatePassword, 
    updateUserProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <CircularProgress />
      ) : children}
    </AuthContext.Provider>
  )
}