import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { BRAND_NAME, BRAND_TAGLINE, BRAND_LOGO } from '@constants/branding';
import PawTrail from '@components/PawTrail';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch } from '@hooks/index';
import { loginStart, loginSuccess, loginFailure } from '@store/authSlice';
import { authService } from '@services/authService';
import { apiClient } from '@utils/api';
import CustomTextInput from '@components/TextInput';
import Button from '@components/Button';

const loginSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setGeneralError(null);
    dispatch(loginStart());

    try {
      const response = await authService.login({
        email: data.email,
        password: data.password,
      });

      dispatch(loginSuccess(response));
      apiClient.setAuthToken(response.token);
    } catch (error) {
      const generic = 'Email o contraseña incorrectos.';
      setGeneralError(generic);
      dispatch(loginFailure(generic));
      Alert.alert('Error', generic);
      // eslint-disable-next-line no-console
      console.warn('Login error:', (error as { message?: string })?.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <PawTrail count={6} />
        {BRAND_LOGO ? (
          <Image source={BRAND_LOGO} style={styles.logo} resizeMode="contain" />
        ) : (
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoEmoji}>🐾</Text>
          </View>
        )}
        <Text style={styles.title}>{BRAND_NAME}</Text>
        <Text style={styles.subtitle}>{BRAND_TAGLINE}</Text>
        <PawTrail count={5} />
      </View>

      {generalError && (
        <View style={styles.errorBox}>
          <Text style={styles.errorBoxText}>{generalError}</Text>
        </View>
      )}

      <View style={styles.form}>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <CustomTextInput
              label="Correo electrónico"
              placeholder="tu@correo.com"
              value={value}
              onChangeText={onChange}
              error={errors.email?.message}
              required
              keyboardType="email-address"
              editable={!isLoading}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <CustomTextInput
              label="Contraseña"
              placeholder="••••••••"
              value={value}
              onChangeText={onChange}
              error={errors.password?.message}
              required
              secureTextEntry
              editable={!isLoading}
            />
          )}
        />

        <Button
          title="Ingresar"
          onPress={handleSubmit(onSubmit)}
          loading={isLoading}
          disabled={isLoading}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          ¿No tenés cuenta? Pedí a un administrador que te registre.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    padding: 20,
    paddingTop: 40,
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  logoPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FCE7F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoEmoji: {
    fontSize: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorBox: {
    backgroundColor: '#ffebee',
    borderLeftWidth: 4,
    borderLeftColor: '#d32f2f',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
    borderRadius: 4,
  },
  errorBoxText: {
    color: '#d32f2f',
    fontSize: 14,
    fontWeight: '500',
  },
  form: {
    marginBottom: 30,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: '#666',
    fontSize: 14,
  },
  linkText: {
    color: '#EC4899',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default LoginScreen;
