import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { supabase } from './lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [stage, setStage] = useState<'email' | 'code'>('email')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function sendCode() {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOtp({ email })
    setLoading(false)
    if (error) setError(error.message)
    else setStage('code')
  }

  async function verifyCode() {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.verifyOtp({ email, token: code, type: 'email' })
    setLoading(false)
    if (error) setError(error.message)
    // On success, the auth listener in App.tsx handles the rest
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Pitched</Text>
      <Text style={styles.subheading}>
        {stage === 'email' ? 'Sign in with your email' : 'Enter the code we emailed you'}
      </Text>

      {stage === 'email' ? (
        <>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="your@email.com"
            placeholderTextColor="#3F4354"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity style={styles.button} onPress={sendCode} disabled={loading}>
            {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.buttonText}>Send Code</Text>}
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TextInput
            style={styles.input}
            value={code}
            onChangeText={setCode}
            placeholder="123456"
            placeholderTextColor="#3F4354"
            keyboardType="number-pad"
          />
          <TouchableOpacity style={styles.button} onPress={verifyCode} disabled={loading}>
            {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.buttonText}>Verify & Sign In</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setStage('email')}>
            <Text style={styles.link}>Use a different email</Text>
          </TouchableOpacity>
        </>
      )}

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#13151A', paddingHorizontal: 24, justifyContent: 'center' },
  heading: { fontSize: 40, fontWeight: '700', color: '#F4F5F7', marginBottom: 8 },
  subheading: { fontSize: 15, color: '#A8AEBE', marginBottom: 32 },
  input: { backgroundColor: '#1C1F27', borderWidth: 1, borderColor: '#2E3240', borderRadius: 12, padding: 16, color: '#F4F5F7', fontSize: 16, marginBottom: 14 },
  button: { backgroundColor: '#10B981', borderRadius: 13, padding: 16, alignItems: 'center' },
  buttonText: { color: '#000', fontSize: 16, fontWeight: '600' },
  link: { color: '#A8AEBE', fontSize: 14, textAlign: 'center', marginTop: 16 },
  error: { color: '#EF4444', marginTop: 20, textAlign: 'center' },
})