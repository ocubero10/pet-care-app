import React, { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiClient } from '@utils/api';
import { usersService, ManagedUser } from '@services/usersService';
import { useAppSelector } from '@hooks/index';
import CustomTextInput from '@components/TextInput';
import Button from '@components/Button';

type RoleValue = 'owner' | 'staff';

const roleOptions: Array<{ label: string; value: RoleValue }> = [
  { label: 'Cliente', value: 'owner' },
  { label: 'Administrador', value: 'staff' },
];

const sexOptions: Array<{ label: string; value: 'male' | 'female' }> = [
  { label: 'Macho', value: 'male' },
  { label: 'Hembra', value: 'female' },
];

const splitToArray = (value?: string): string[] =>
  value
    ? value
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

const userSchema = z
  .object({
    name: z.string().min(2, 'Nombre debe tener al menos 2 caracteres'),
    email: z
      .string()
      .optional()
      .refine(
        (v) => !v || z.string().email().safeParse(v).success,
        'Email inválido'
      ),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    phone: z.string().regex(/^\d{8}$/, 'Teléfono debe tener 8 dígitos'),
    role: z.enum(['owner', 'staff']).refine((v) => !!v, 'Rol requerido'),
    cedula: z.string().optional(),
    petName: z.string().optional(),
    petBreed: z.string().optional(),
    petAge: z.string().optional(),
    petSex: z.enum(['male', 'female']).optional(),
    petWeight: z.string().optional(),
    petCoatColor: z.string().optional(),
    petAllergies: z.string().optional(),
    petVaccines: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // Email is required for staff (they need it to log in); optional for owners (clients).
    if (data.role !== 'owner' && !data.email) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['email'],
        message: 'Email requerido',
      });
    }
    if (data.role !== 'owner') return;

    const issues: Array<[keyof typeof data, string]> = [];

    if (!data.cedula || !/^\d{9,12}$/.test(data.cedula)) {
      issues.push(['cedula', 'Cédula o DIMEX: 9 a 12 dígitos']);
    }
    if (!data.petName || data.petName.trim().length < 1) {
      issues.push(['petName', 'Nombre de la mascota requerido']);
    }
    if (!data.petBreed || data.petBreed.trim().length < 1) {
      issues.push(['petBreed', 'Especie / Raza requerida']);
    }
    if (!data.petAge || !/^\d+(\.\d+)?$/.test(data.petAge)) {
      issues.push(['petAge', 'Edad debe ser un número']);
    }
    if (!data.petSex) {
      issues.push(['petSex', 'Sexo requerido']);
    }
    if (!data.petWeight || !/^\d+(\.\d+)?$/.test(data.petWeight) || Number(data.petWeight) <= 0) {
      issues.push(['petWeight', 'Peso debe ser mayor a 0']);
    }
    if (!data.petCoatColor || data.petCoatColor.trim().length < 1) {
      issues.push(['petCoatColor', 'Color del manto requerido']);
    }

    for (const [path, message] of issues) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: [path], message });
    }
  });

type UserFormData = z.infer<typeof userSchema>;

interface RegisterApiResponse {
  success: boolean;
  message?: string;
  data?: { user: { name: string; email: string; role: string } };
}

type RoleFilter = 'all' | 'owner' | 'staff';

const ROLE_LABELS: Record<string, string> = {
  owner: 'Cliente',
  staff: 'Administrador',
  driver: 'Driver',
};

const StaffDashboardScreen: React.FC = () => {
  const currentUser = useAppSelector((state) => state.auth.user);

  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [generalSuccess, setGeneralSuccess] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<RoleValue | null>(null);
  const [selectedSex, setSelectedSex] = useState<'male' | 'female' | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Users management state
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCedula, setEditCedula] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editRole, setEditRole] = useState<'owner' | 'staff' | 'driver'>('owner');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter]);

  // Also refresh the list whenever the dashboard screen regains focus, so
  // changes made elsewhere (a new user created or an edit) show up.
  useFocusEffect(
    useCallback(() => {
      loadUsers();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roleFilter])
  );

  const loadUsers = async () => {
    try {
      const list = await usersService.listUsers(
        roleFilter === 'all' ? undefined : { role: roleFilter }
      );
      setUsers(list);
    } catch {
      // ignore — list section just stays empty
    }
  };

  const startEditUser = (u: ManagedUser) => {
    setEditingUserId(u._id);
    setEditName(u.name);
    setEditEmail(u.email);
    setEditPhone(u.phone);
    setEditCedula(u.cedula || '');
    setEditRole(u.role);
    setEditPassword('');
  };

  const cancelEditUser = () => {
    setEditingUserId(null);
    setEditPassword('');
  };

  const saveEditUser = async (id: string) => {
    setIsSavingEdit(true);
    try {
      const payload: Parameters<typeof usersService.updateUser>[1] = {
        name: editName,
        email: editEmail,
        phone: editPhone,
        role: editRole,
      };
      if (editCedula) payload.cedula = editCedula;
      if (editPassword) payload.password = editPassword;
      await usersService.updateUser(id, payload);
      await loadUsers();
      setEditingUserId(null);
      setEditPassword('');
      Alert.alert('Listo', 'Usuario actualizado');
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el usuario.');
      // eslint-disable-next-line no-console
      console.warn('Update user error:', (error as { message?: string })?.message);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const confirmDeleteUser = (u: ManagedUser) => {
    if (u._id === currentUser?.id) {
      Alert.alert('Error', 'No podés eliminar tu propia cuenta.');
      return;
    }
    Alert.alert(
      'Eliminar usuario',
      `¿Seguro que querés desactivar a ${u.name}? El usuario no podrá ingresar más a la app.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await usersService.deleteUser(u._id);
              await loadUsers();
              Alert.alert('Listo', 'Usuario desactivado');
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el usuario.');
              // eslint-disable-next-line no-console
              console.warn('Delete user error:', (error as { message?: string })?.message);
            }
          },
        },
      ]
    );
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      phone: '',
      role: undefined,
      cedula: '',
      petName: '',
      petBreed: '',
      petAge: '',
      petSex: undefined,
      petWeight: '',
      petCoatColor: '',
      petAllergies: '',
      petVaccines: '',
    },
  });

  const handleRoleSelect = (role: RoleValue) => {
    setSelectedRole(role);
    setValue('role', role);
  };

  const handleSexSelect = (value: 'male' | 'female') => {
    setSelectedSex(value);
    setValue('petSex', value);
  };

  const onSubmit = async (data: UserFormData) => {
    setIsLoading(true);
    setGeneralError(null);
    setGeneralSuccess(null);

    try {
      const payload: Record<string, unknown> = {
        name: data.name,
        password: data.password,
        phone: data.phone,
        role: data.role,
      };
      if (data.email) payload.email = data.email;
      if (data.role === 'owner') {
        payload.cedula = data.cedula;
        payload.petName = data.petName;
        payload.petBreed = data.petBreed;
        payload.petAge = data.petAge ? Number(data.petAge) : undefined;
        payload.petSex = data.petSex;
        payload.petWeight = data.petWeight ? Number(data.petWeight) : undefined;
        payload.petCoatColor = data.petCoatColor;
        payload.petAllergies = splitToArray(data.petAllergies);
        payload.petVaccines = splitToArray(data.petVaccines);
      }

      const response = await apiClient.post<RegisterApiResponse>('/auth/register', payload);
      const userName = response.data?.user?.name ?? data.name;
      setGeneralSuccess(
        data.email
          ? `Cuenta creada para ${userName} (${data.email})`
          : `Cuenta creada para ${userName}`
      );
      reset();
      setSelectedRole(null);
      setSelectedSex(null);
      setShowCreateForm(false);
      await loadUsers();
    } catch (error) {
      const apiMessage = (error as { message?: string })?.message;
      const finalMessage =
        apiMessage && apiMessage !== 'Request failed'
          ? apiMessage
          : 'No se pudo crear la cuenta. Verificá los datos e intentá de nuevo.';
      setGeneralError(finalMessage);
      Alert.alert('No se pudo crear la cuenta', finalMessage);
      // eslint-disable-next-line no-console
      console.warn('Create user error:', apiMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Panel de control</Text>

      <View style={{ marginBottom: 16 }}>
        <Button
          title={showCreateForm ? 'Cancelar' : '+ Crear nueva cuenta'}
          variant={showCreateForm ? 'secondary' : 'primary'}
          onPress={() => setShowCreateForm((v) => !v)}
        />
      </View>

      {showCreateForm && (
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Crear nueva cuenta de usuario</Text>
        <Text style={styles.subtitle}>
          Solo el administrador puede crear cuentas. Los clientes no pueden auto-registrarse.
        </Text>

        {generalError && (
          <View style={styles.errorBox}>
            <Text style={styles.errorBoxText}>{generalError}</Text>
          </View>
        )}
        {generalSuccess && (
          <View style={styles.successBox}>
            <Text style={styles.successBoxText}>{generalSuccess}</Text>
          </View>
        )}

        <Text style={styles.label}>Tipo de usuario *</Text>
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

        <Text style={styles.groupTitle}>Datos del usuario</Text>

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
              placeholder="cliente@ejemplo.com"
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

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <CustomTextInput
              label="Contraseña (mín. 6)"
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

            <Text style={styles.groupTitle}>Datos de la mascota</Text>

            <Controller
              control={control}
              name="petName"
              render={({ field: { onChange, value } }) => (
                <CustomTextInput
                  label="Nombre"
                  placeholder="Firulais"
                  value={value ?? ''}
                  onChangeText={onChange}
                  error={errors.petName?.message}
                  required
                  editable={!isLoading}
                />
              )}
            />

            <Controller
              control={control}
              name="petBreed"
              render={({ field: { onChange, value } }) => (
                <CustomTextInput
                  label="Especie / Raza"
                  placeholder="Perro / Labrador"
                  value={value ?? ''}
                  onChangeText={onChange}
                  error={errors.petBreed?.message}
                  required
                  editable={!isLoading}
                />
              )}
            />

            <Controller
              control={control}
              name="petAge"
              render={({ field: { onChange, value } }) => (
                <CustomTextInput
                  label="Edad (años)"
                  placeholder="3"
                  value={value ?? ''}
                  onChangeText={onChange}
                  error={errors.petAge?.message}
                  required
                  keyboardType="number-pad"
                  editable={!isLoading}
                />
              )}
            />

            <Text style={styles.label}>Sexo *</Text>
            <View style={styles.sexSelector}>
              {sexOptions.map((option) => (
                <Pressable
                  key={option.value}
                  onPress={() => handleSexSelect(option.value)}
                  style={[
                    styles.sexOption,
                    selectedSex === option.value && styles.sexOptionSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.sexOptionText,
                      selectedSex === option.value && styles.sexOptionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            {errors.petSex && <Text style={styles.errorText}>{errors.petSex.message}</Text>}

            <Controller
              control={control}
              name="petWeight"
              render={({ field: { onChange, value } }) => (
                <CustomTextInput
                  label="Peso (kg)"
                  placeholder="12.5"
                  value={value ?? ''}
                  onChangeText={onChange}
                  error={errors.petWeight?.message}
                  required
                  keyboardType="decimal-pad"
                  editable={!isLoading}
                />
              )}
            />

            <Controller
              control={control}
              name="petCoatColor"
              render={({ field: { onChange, value } }) => (
                <CustomTextInput
                  label="Color del manto / pelo"
                  placeholder="Negro y blanco"
                  value={value ?? ''}
                  onChangeText={onChange}
                  error={errors.petCoatColor?.message}
                  required
                  editable={!isLoading}
                />
              )}
            />

            <Controller
              control={control}
              name="petAllergies"
              render={({ field: { onChange, value } }) => (
                <CustomTextInput
                  label="Alergias (separadas por coma)"
                  placeholder="pollo, polen"
                  value={value ?? ''}
                  onChangeText={onChange}
                  error={errors.petAllergies?.message}
                  editable={!isLoading}
                />
              )}
            />

            <Controller
              control={control}
              name="petVaccines"
              render={({ field: { onChange, value } }) => (
                <CustomTextInput
                  label="Vacunas (separadas por coma)"
                  placeholder="rabia, parvovirus"
                  value={value ?? ''}
                  onChangeText={onChange}
                  error={errors.petVaccines?.message}
                  editable={!isLoading}
                />
              )}
            />
          </>
        )}

        <View style={{ marginTop: 12 }}>
          <Button
            title="Crear cuenta"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            disabled={isLoading}
          />
        </View>
      </View>
      )}

      {/* === Gestión de usuarios existentes === */}
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Usuarios existentes</Text>

        <View style={styles.filterRow}>
          {([
            ['all', 'Todos'],
            ['owner', 'Clientes'],
            ['staff', 'Administradores'],
          ] as Array<[RoleFilter, string]>).map(([val, label]) => (
            <Pressable
              key={val}
              onPress={() => setRoleFilter(val)}
              style={[styles.filterPill, roleFilter === val && styles.filterPillSelected]}
            >
              <Text
                style={[styles.filterText, roleFilter === val && styles.filterTextSelected]}
              >
                {label}
              </Text>
            </Pressable>
          ))}
        </View>

        <CustomTextInput
          label="Buscar"
          placeholder="Nombre, correo o cédula..."
          value={userSearch}
          onChangeText={setUserSearch}
        />

        {(() => {
          const q = userSearch.trim().toLowerCase();
          const filtered = q
            ? users.filter(
                (u) =>
                  u.name.toLowerCase().includes(q) ||
                  u.email.toLowerCase().includes(q) ||
                  (u.cedula || '').toLowerCase().includes(q) ||
                  u.phone.toLowerCase().includes(q)
              )
            : users;

          if (users.length === 0) {
            return <Text style={styles.muted}>No hay usuarios.</Text>;
          }
          if (filtered.length === 0) {
            return (
              <Text style={styles.muted}>
                No se encontraron resultados para "{userSearch}".
              </Text>
            );
          }
          return filtered.map((u) => {
            const isEditing = editingUserId === u._id;
            const isSelf = u._id === currentUser?.id;
            return (
              <View key={u._id} style={styles.userCard}>
                <Text style={styles.userName}>
                  {u.name} {isSelf ? '(vos)' : ''}
                </Text>
                <Text style={styles.userMeta}>
                  {ROLE_LABELS[u.role] || u.role} · {u.email}
                </Text>
                <Text style={styles.userMeta}>
                  Tel: {u.phone}
                  {u.cedula ? ` · Cédula: ${u.cedula}` : ''}
                </Text>

                {!isEditing && (
                  <View style={styles.userActions}>
                    <View style={{ flex: 1 }}>
                      <Button
                        title="Editar"
                        variant="secondary"
                        onPress={() => startEditUser(u)}
                      />
                    </View>
                    <View style={{ width: 8 }} />
                    <View style={{ flex: 1 }}>
                      <Button
                        title="Eliminar"
                        variant="danger"
                        onPress={() => confirmDeleteUser(u)}
                      />
                    </View>
                  </View>
                )}

                {isEditing && (
                  <View style={styles.editBlock}>
                    <CustomTextInput
                      label="Nombre"
                      value={editName}
                      onChangeText={setEditName}
                    />
                    <CustomTextInput
                      label="Correo"
                      value={editEmail}
                      onChangeText={setEditEmail}
                      keyboardType="email-address"
                    />
                    <CustomTextInput
                      label="Teléfono (8 dígitos)"
                      value={editPhone}
                      onChangeText={setEditPhone}
                      keyboardType="phone-pad"
                    />
                    {(u.role === 'owner' || editRole === 'owner') && (
                      <CustomTextInput
                        label="Cédula / DIMEX"
                        value={editCedula}
                        onChangeText={setEditCedula}
                        keyboardType="number-pad"
                      />
                    )}

                    <Text style={styles.label}>Rol</Text>
                    <View style={styles.roleSelector}>
                      {([
                        ['owner', 'Cliente'],
                        ['staff', 'Administrador'],
                      ] as Array<['owner' | 'staff', string]>).map(([val, label]) => (
                        <Pressable
                          key={val}
                          onPress={() => setEditRole(val)}
                          style={[
                            styles.roleOption,
                            editRole === val && styles.roleOptionSelected,
                          ]}
                        >
                          <Text
                            style={[
                              styles.roleOptionText,
                              editRole === val && styles.roleOptionTextSelected,
                            ]}
                          >
                            {label}
                          </Text>
                        </Pressable>
                      ))}
                    </View>

                    <CustomTextInput
                      label="Nueva contraseña (dejar vacío para no cambiarla)"
                      value={editPassword}
                      onChangeText={setEditPassword}
                      placeholder="••••••••"
                      secureTextEntry
                    />

                    <View style={styles.editActions}>
                      <View style={{ flex: 1 }}>
                        <Button
                          title="Guardar"
                          loading={isSavingEdit}
                          disabled={isSavingEdit}
                          onPress={() => saveEditUser(u._id)}
                        />
                      </View>
                      <View style={{ width: 8 }} />
                      <View style={{ flex: 1 }}>
                        <Button
                          title="Cancelar"
                          variant="secondary"
                          onPress={cancelEditUser}
                        />
                      </View>
                    </View>
                  </View>
                )}
              </View>
            );
          });
        })()}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#333', marginBottom: 16 },
  formSection: {
    backgroundColor: '#fafafa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  muted: { color: '#888', fontStyle: 'italic', marginBottom: 12 },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  filterPill: {
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  filterPillSelected: { borderColor: '#EC4899', backgroundColor: '#FCE7F3' },
  filterText: { fontSize: 13, color: '#666' },
  filterTextSelected: { color: '#BE185D', fontWeight: '600' },
  userCard: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  userName: { fontSize: 16, fontWeight: '600', color: '#333' },
  userMeta: { fontSize: 13, color: '#666', marginTop: 2 },
  userActions: { flexDirection: 'row', marginTop: 10 },
  editBlock: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  editActions: { flexDirection: 'row', marginTop: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#777', marginBottom: 16 },
  groupTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  label: { fontSize: 14, fontWeight: '500', color: '#444', marginBottom: 8 },
  errorBox: {
    backgroundColor: '#ffebee',
    borderLeftWidth: 4,
    borderLeftColor: '#d32f2f',
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 12,
    borderRadius: 4,
  },
  errorBoxText: { color: '#d32f2f', fontSize: 14 },
  successBox: {
    backgroundColor: '#e8f5e9',
    borderLeftWidth: 4,
    borderLeftColor: '#2e7d32',
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 12,
    borderRadius: 4,
  },
  successBoxText: { color: '#2e7d32', fontSize: 14 },
  errorText: { color: '#d32f2f', fontSize: 12, marginBottom: 8 },
  roleSelector: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  roleOption: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  roleOptionSelected: { borderColor: '#EC4899' },
  roleOptionText: { fontSize: 13, fontWeight: '500', color: '#666', textAlign: 'center' },
  roleOptionTextSelected: { color: '#EC4899' },
  sexSelector: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  sexOption: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  sexOptionSelected: { borderColor: '#EC4899' },
  sexOptionText: { fontSize: 14, fontWeight: '500', color: '#666' },
  sexOptionTextSelected: { color: '#EC4899' },
});

export default StaffDashboardScreen;
