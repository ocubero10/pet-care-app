import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch } from '@hooks/index';
import { loginSuccess, loginFailure } from '@store/authSlice';
import { authService } from '@services/authService';
import { apiClient } from '@utils/api';
import CustomTextInput from '@components/TextInput';
import Button from '@components/Button';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Nombre debe tener al menos 2 caracteres'),
    email: z
      .string()
      .optional()
      .refine(
        (v) => !v || z.string().email().safeParse(v).success,
        'Correo electrónico inválido'
      ),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    phone: z.string().regex(/^\d{8}$/, 'Teléfono debe tener 8 dígitos'),
    role: z.enum(['owner', 'staff', 'driver']).refine((v) => !!v, 'Seleccioná un rol'),
    cedula: z.string().optional(),
    petName: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // Email is required for staff/driver (needed for login); optional for owners (clients).
    if (data.role !== 'owner' && !data.email) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['email'],
        message: 'Correo electrónico requerido',
      });
    }
    if (data.role === 'owner') {
      if (!data.cedula || !/^\d{9,12}$/.test(data.cedula)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['cedula'],
          message: 'Cédula / DIMEX: 9 a 12 dígitos',
        });
      }
      if (!data.petName || data.petName.trim().length < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['petName'],
          message: 'Pet name is required',
        });
      }
    }
  });

type RegisterFormData = z.infer<typeof registerSchema>;

const roleOptions: Array<{ label: string; value: 'owner' | 'staff' | 'driver' }> = [
  { label: 'Cliente', value: 'owner' },
  { label: 'Administrador', value: 'staff' },
];

const RegisterScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<'owner' | 'staff' | 'driver' | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      phone: '',
      role: undefined,
      cedula: '',
      petName: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setGeneralError(null);

    try {
      const response = await authService.register(data);
      dispatch(loginSuccess(response));
      apiClient.setAuthToken(response.token);
    } catch (error) {
      const genericMessage = 'No se pudo crear la cuenta. Verificá los datos e intentá de nuevo.';
      setGeneralError(genericMessage);
      dispatch(loginFailure(genericMessage));
      Alert.alert('Error', genericMessage);
      // Backend message kept in console for debugging only:
      // eslint-disable-next-line no-console
      console.warn('Register error:', (error as { message?: string })?.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleSelect = (role: 'owner' | 'staff' | 'driver') => {
    setSelectedRole(role);
    setValue('role', role);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Crear cuenta</Text>
        <Text style={styles.subtitle}>Bienvenido a Liz & Pets</Text>
      </View>

      {generalError && (
        <View style={styles.errorBox}>
          <Text style={styles.errorBoxText}>{generalError}</Text>
        </View>
      )}

      <View style={styles.form}>
        <Text style={styles.sectionTitle}>Tipo de usuario</Text>
        <View style={styles.roleSelector}>
          {roleOptions.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => handleRoleSelect(option.value)}
              style={[
                styles.roleOption,
                selectedRole === option.value && styles.roleOptionSelected,
              ]}
            >
              <Text
                style={[
                  styles.roleOptionText,
                  selectedRole === option.value && styles.roleOptionTextSelected,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
        {errors.role && <Text style={styles.errorText}>{errors.role.message}</Text>}

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Información de la cuenta</Text>

        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <CustomTextInput
              label="Nombre completo"
              placeholder="Juan Pérez"
              value={value}
              onChangeText={onChange}
              error={errors.name?.message}
              required
              editable={!isLoading}
            />
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <CustomTextInput
              label={
                selectedRole === 'owner'
                  ? 'Correo electrónico (opcional)'
                  : 'Correo electrónico'
              }
              placeholder="tu@correo.com"
              value={value ?? ''}
              onChangeText={onChange}
              error={errors.email?.message}
              required={selectedRole !== 'owner'}
              keyboardType="email-address"
              editable={!isLoading}
            />
          )}
        />

        <Controller
          control={control}
          name="phone"
          render={({ field: { onChange, value } }) => (
            <CustomTextInput
              label="Teléfono (8 dígitos)"
              placeholder="88887777"
              value={value}
              onChangeText={onChange}
              error={errors.phone?.message}
              required
              keyboardType="phone-pad"
              editable={!isLoading}
            />
          )}
        />

        {selectedRole === 'owner' && (
          <>
            <Controller
              control={control}
              name="cedula"
              render={({ field: { onChange, value } }) => (
                <CustomTextInput
                  label="Cédula o DIMEX"
                  placeholder="123456789 o 155812345678"
                  value={value ?? ''}
                  onChangeText={onChange}
                  error={errors.cedula?.message}
                  required
                  keyboardType="number-pad"
                  editable={!isLoading}
                />
              )}
            />

            <Controller
              control={control}
              name="petName"
              render={({ field: { onChange, value } }) => (
                <CustomTextInput
                  label="Nombre de la mascota"
                  placeholder="Firulais"
                  value={value ?? ''}
                  onChangeText={onChange}
                  error={errors.petName?.message}
                  required
                  editable={!isLoading}
                />
              )}
            />
          </>
        )}

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
          title="Crear cuenta"
          onPress={handleSubmit(onSubmit)}
          loading={isLoading}
          disabled={isLoading}
        />
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
    paddingTop: 30,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  roleSelector: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  roleOption: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  roleOptionSelected: {
    borderColor: '#EC4899',
  },
  roleOptionText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
    textAlign: 'center',
  },
  roleOptionTextSelected: {
    color: '#EC4899',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 12,
    marginBottom: 16,
  },
});

export default RegisterScreen;
