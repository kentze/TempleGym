import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/auth.store';
import type { AuthResponse } from '@templegym/types';

type Step = 'email' | 'code';

export default function LoginScreen() {
  const { setToken, setUser } = useAuthStore();

  const [step, setStep]       = useState<Step>('email');
  const [email, setEmail]     = useState('');
  const [code, setCode]       = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  async function handleRequestOtp() {
    setError(null);
    if (!email.toLowerCase().endsWith('@temple.edu')) {
      setError('A @temple.edu email address is required.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/request-otp', { email: email.toLowerCase() });
      setStep('code');
    } catch (e: any) {
      setError(e.response?.data?.error ?? 'Failed to send code. Try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp() {
    setError(null);
    if (code.length !== 6) {
      setError('Enter the 6-digit code sent to your email.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post<AuthResponse>('/auth/verify-otp', {
        email: email.toLowerCase(),
        code,
      });
      await setToken(data.token);
      setUser(data.user);
    } catch (e: any) {
      setError(e.response?.data?.error ?? 'Invalid or expired code.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>TempleGym</Text>
        <Text style={styles.subtitle}>
          {step === 'email' ? 'Sign in with your Temple email' : `Code sent to ${email}`}
        </Text>

        {step === 'email' ? (
          <TextInput
            style={styles.input}
            placeholder="you@temple.edu"
            placeholderTextColor={Colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
            onSubmitEditing={handleRequestOtp}
            returnKeyType="send"
          />
        ) : (
          <TextInput
            style={[styles.input, styles.inputCode]}
            placeholder="000000"
            placeholderTextColor={Colors.textMuted}
            keyboardType="number-pad"
            maxLength={6}
            value={code}
            onChangeText={setCode}
            onSubmitEditing={handleVerifyOtp}
            returnKeyType="done"
            autoFocus
          />
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={step === 'email' ? handleRequestOtp : handleVerifyOtp}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color={Colors.text} />
            : <Text style={styles.buttonText}>{step === 'email' ? 'Send Code' : 'Sign In'}</Text>
          }
        </TouchableOpacity>

        {step === 'code' && (
          <TouchableOpacity onPress={() => { setStep('email'); setCode(''); setError(null); }}>
            <Text style={styles.back}>Use a different email</Text>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', padding: 24 },
  card:           { width: '100%', maxWidth: 360, gap: 16 },
  title:          { fontSize: 28, fontWeight: '700', color: Colors.text, textAlign: 'center' },
  subtitle:       { fontSize: 14, color: Colors.textMuted, textAlign: 'center' },
  input:          { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 12, color: Colors.text, fontSize: 16 },
  inputCode:      { textAlign: 'center', letterSpacing: 8, fontSize: 22 },
  error:          { color: Colors.error, fontSize: 13, textAlign: 'center' },
  button:         { backgroundColor: Colors.primary, borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  buttonDisabled: { opacity: 0.6 },
  buttonText:     { color: Colors.text, fontSize: 16, fontWeight: '600' },
  back:           { color: Colors.textMuted, fontSize: 13, textAlign: 'center', textDecorationLine: 'underline' },
});
