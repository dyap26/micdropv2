import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { useAuth } from '../../context/AuthContext';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const { signUp } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRegister = async () => {
    setError(null);
    if (!username.trim() || !email.trim() || !password) {
      setError('All fields are required.');
      return;
    }
    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      await signUp(email.trim().toLowerCase(), password, username.trim().toLowerCase());
      setSuccess(true);
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center', alignItems: 'center', padding: 32 }}>
        <View style={{
          width: 64, height: 64, borderRadius: 32,
          backgroundColor: '#6C47FF22',
          justifyContent: 'center', alignItems: 'center',
          marginBottom: 24,
        }}>
          <Text style={{ fontSize: 28, color: '#6C47FF' }}>✓</Text>
        </View>
        <Text style={{ color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 12, textAlign: 'center' }}>
          Check your email
        </Text>
        <Text style={{ color: '#888', fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 32 }}>
          We sent a confirmation link to{' '}
          <Text style={{ color: '#fff' }}>{email.trim().toLowerCase()}</Text>.
          {'\n\n'}
          Click the link to activate your account, then sign in.
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          style={{
            backgroundColor: '#6C47FF',
            borderRadius: 10,
            paddingVertical: 14,
            paddingHorizontal: 32,
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 15 }}>Go to sign in</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: '#0a0a0a' }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 28 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={{ fontSize: 28, fontWeight: '700', color: '#fff', marginBottom: 6 }}>
          Create account
        </Text>
        <Text style={{ fontSize: 15, color: '#888', marginBottom: 36 }}>
          Find your band.
        </Text>

        <TextInput
          value={username}
          onChangeText={v => { setUsername(v); setError(null); }}
          placeholder="Username"
          placeholderTextColor="#555"
          autoCapitalize="none"
          autoCorrect={false}
          style={inputStyle}
        />

        <TextInput
          value={email}
          onChangeText={v => { setEmail(v); setError(null); }}
          placeholder="Email"
          placeholderTextColor="#555"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          style={[inputStyle, { marginTop: 12 }]}
        />

        <TextInput
          value={password}
          onChangeText={v => { setPassword(v); setError(null); }}
          placeholder="Password (8+ characters)"
          placeholderTextColor="#555"
          secureTextEntry
          style={[inputStyle, { marginTop: 12 }]}
        />

        {error && (
          <View style={{
            marginTop: 14,
            backgroundColor: '#ff4d4d18',
            borderRadius: 8,
            borderWidth: 0.5,
            borderColor: '#ff4d4d44',
            padding: 12,
          }}>
            <Text style={{ color: '#ff6b6b', fontSize: 13 }}>{error}</Text>
          </View>
        )}

        <TouchableOpacity
          onPress={handleRegister}
          disabled={loading}
          style={{
            marginTop: 24,
            backgroundColor: '#6C47FF',
            borderRadius: 10,
            paddingVertical: 15,
            alignItems: 'center',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>Create account</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          style={{ marginTop: 20, alignItems: 'center' }}
        >
          <Text style={{ color: '#888', fontSize: 14 }}>
            Already have an account?{' '}
            <Text style={{ color: '#6C47FF' }}>Sign in</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const inputStyle = {
  backgroundColor: '#141414',
  borderRadius: 10,
  paddingHorizontal: 16,
  paddingVertical: 14,
  color: '#fff' as const,
  fontSize: 15,
  borderWidth: 0.5,
  borderColor: '#2a2a2a',
};
