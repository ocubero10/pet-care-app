import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
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

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().regex(/^\d{10}$/, 'Phone must be 10 digits'),
  role: z.enum(['owner', 'staff', 'driver']).refine((v) => !!v, 'Please select a role'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

const roleOptions: Array<{ label: string; value: 'owner' | 'staff' | 'driver' }> = [
  { label: 'Pet Owner', value: 'owner' },
  { label: 'Grooming Staff', value: 'staff' },
  { label: 'Driver', value: 'driver' },
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
      const message =
        error instanceof Error ? error.message : 'Registration failed. Please try again.';
      setGeneralError(message);
      dispatch(loginFailure(message));
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
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join Pet Care Pro</Text>
      </View>

      {generalError && (
        <View style={styles.errorBox}>
          <Text style={styles.errorBoxText}>{generalError}</Text>
        </View>
      )}

      <View style={styles.form}>
        <Text style={styles.sectionTitle}>Select Your Role</Text>
        <View style={styles.roleSelector}>
          {roleOptions.map((option) => (
            <View key={option.value} style={styles.roleOption}>
              <Text
                onPress={() => handleRoleSelect(option.value)}
                style={[
                  styles.roleOptionText,
                  selectedRole === option.value && styles.roleOptionTextSelected,
                ]}
              >
                {option.label}
              </Text>
            </View>
          ))}
        </View>
        {errors.role && <Text style={styles.errorText}>{errors.role.message}</Text>}

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Account Information</Text>

        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <CustomTextInput
              label="Full Name"
              placeholder="John Doe"
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
              label="Email Address"
              placeholder="your@email.com"
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
          name="phone"
          render={({ field: { onChange, value } }) => (
            <CustomTextInput
              label="Phone Number"
              placeholder="1234567890"
              value={value}
              onChangeText={onChange}
              error={errors.phone?.message}
              required
              keyboardType="phone-pad"
              editable={!isLoading}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <CustomTextInput
              label="Password"
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
          title="Create Account"
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
  roleOptionText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
    textAlign: 'center',
  },
  roleOptionTextSelected: {
    color: '#4CAF50',
    borderColor: '#4CAF50',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 12,
    marginBottom: 16,
  },
});

export default RegisterScreen;
