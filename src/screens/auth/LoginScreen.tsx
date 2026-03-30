import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { useAuth } from '../../context/AuthContext';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      await signIn(email.trim().toLowerCase(), password);
    } catch (e: any) {
      setError(e.message ?? 'Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: '#0a0a0a' }}
    >
      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 28 }}>
        <Text style={{ fontSize: 36, fontWeight: '700', color: '#fff', marginBottom: 6 }}>
          MicDrop
        </Text>
        <Text style={{ fontSize: 15, color: '#888', marginBottom: 40 }}>
          Your music, reviewed.
        </Text>

        <TextInput
          value={email}
          onChangeText={v => { setEmail(v); setError(null); }}
          placeholder="Email"
          placeholderTextColor="#555"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          style={inputStyle}
        />

        <TextInput
          value={password}
          onChangeText={v => { setPassword(v); setError(null); }}
          placeholder="Password"
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
          onPress={handleLogin}
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
            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>Sign in</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Register')}
          style={{ marginTop: 20, alignItems: 'center' }}
        >
          <Text style={{ color: '#888', fontSize: 14 }}>
            Don't have an account?{' '}
            <Text style={{ color: '#6C47FF' }}>Sign up</Text>
          </Text>
        </TouchableOpacity>
      </View>
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
