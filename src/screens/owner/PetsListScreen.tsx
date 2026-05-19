import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppSelector } from '@hooks/index';
import { petsService, usersService } from '@services/index';
import { Pet, Client } from '@definitions/index';
import CustomTextInput from '@components/TextInput';
import Button from '@components/Button';

const petSchema = z.object({
  ownerId: z.string().optional(),
  name: z.string().min(1, 'Pet name is required'),
  breed: z.string().min(1, 'Species or breed is required'),
  age: z
    .string()
    .regex(/^\d+(\.\d+)?$/, 'Age must be a number')
    .refine((v) => Number(v) >= 0, 'Age must be ≥ 0'),
  sex: z.enum(['male', 'female']).refine((v) => !!v, 'Sex is required'),
  weight: z
    .string()
    .regex(/^\d+(\.\d+)?$/, 'Weight must be a number')
    .refine((v) => Number(v) > 0, 'Weight must be > 0'),
  coatColor: z.string().min(1, 'Coat color is required'),
  allergies: z.string().optional(),
  vaccines: z.string().optional(),
});

type PetFormData = z.infer<typeof petSchema>;

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

const PetsListScreen: React.FC = () => {
  const currentUser = useAppSelector((state) => state.auth.user);
  const isStaff = currentUser?.role === 'staff';

  const [pets, setPets] = useState<Pet[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedSex, setSelectedSex] = useState<'male' | 'female' | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [generalSuccess, setGeneralSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<PetFormData>({
    resolver: zodResolver(petSchema),
    defaultValues: {
      ownerId: '',
      name: '',
      breed: '',
      age: '',
      sex: undefined,
      weight: '',
      coatColor: '',
      allergies: '',
      vaccines: '',
    },
  });

  useEffect(() => {
    loadPets();
    if (isStaff) loadClients();
  }, [isStaff]);

  const loadPets = async () => {
    try {
      const result = await petsService.getPets();
      setPets(result);
    } catch {
      // ignore — list section will simply stay empty
    }
  };

  const loadClients = async () => {
    try {
      const result = await usersService.getClients();
      setClients(result);
    } catch {
      // ignore
    }
  };

  const handleSexSelect = (value: 'male' | 'female') => {
    setSelectedSex(value);
    setValue('sex', value);
  };

  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId);
    setValue('ownerId', clientId);
  };

  const onSubmit = async (data: PetFormData) => {
    setIsLoading(true);
    setGeneralError(null);
    setGeneralSuccess(null);

    try {
      const created = await petsService.createPet({
        name: data.name,
        breed: data.breed,
        age: Number(data.age),
        sex: data.sex,
        weight: Number(data.weight),
        coatColor: data.coatColor,
        allergies: splitToArray(data.allergies),
        vaccines: splitToArray(data.vaccines),
        ...(isStaff && data.ownerId ? { ownerId: data.ownerId } : {}),
      });
      setPets((prev) => [created, ...prev]);
      setGeneralSuccess(`Mascota "${created.name}" creada correctamente`);
      reset();
      setSelectedSex(null);
      setSelectedClientId(null);
      setShowForm(false);
    } catch (error) {
      const generic = 'No se pudo crear la mascota. Verificá los datos e intentá de nuevo.';
      setGeneralError(generic);
      Alert.alert('Error', generic);
      // eslint-disable-next-line no-console
      console.warn('Create pet error:', (error as { message?: string })?.message);
    } finally {
      setIsLoading(false);
    }
  };

  const canCreate = isStaff;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Mascotas</Text>

      {canCreate && (
        <View style={{ marginBottom: 16 }}>
          <Button
            title={showForm ? 'Cancelar' : '+ Crear nueva mascota'}
            variant={showForm ? 'secondary' : 'primary'}
            onPress={() => setShowForm((v) => !v)}
          />
        </View>
      )}

      {canCreate && showForm && (
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Crear nueva mascota</Text>

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

        {isStaff && (
          <>
            <Text style={styles.label}>Cliente</Text>
            {clients.length === 0 ? (
              <Text style={styles.muted}>No hay clientes registrados aún.</Text>
            ) : (
              <View style={styles.clientList}>
                {clients.map((c) => (
                  <Pressable
                    key={c._id}
                    onPress={() => handleClientSelect(c._id)}
                    style={[
                      styles.clientOption,
                      selectedClientId === c._id && styles.clientOptionSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.clientOptionText,
                        selectedClientId === c._id && styles.clientOptionTextSelected,
                      ]}
                    >
                      {c.name}
                      {c.cedula ? ` · ${c.cedula}` : ''}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </>
        )}

        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <CustomTextInput
              label="Nombre"
              placeholder="Firulais"
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
          name="breed"
          render={({ field: { onChange, value } }) => (
            <CustomTextInput
              label="Especie / Raza"
              placeholder="Perro / Labrador"
              value={value}
              onChangeText={onChange}
              error={errors.breed?.message}
              required
              editable={!isLoading}
            />
          )}
        />

        <Controller
          control={control}
          name="age"
          render={({ field: { onChange, value } }) => (
            <CustomTextInput
              label="Edad (años)"
              placeholder="3"
              value={value}
              onChangeText={onChange}
              error={errors.age?.message}
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
        {errors.sex && <Text style={styles.errorText}>{errors.sex.message}</Text>}

        <Controller
          control={control}
          name="weight"
          render={({ field: { onChange, value } }) => (
            <CustomTextInput
              label="Peso (kg)"
              placeholder="12.5"
              value={value}
              onChangeText={onChange}
              error={errors.weight?.message}
              required
              keyboardType="decimal-pad"
              editable={!isLoading}
            />
          )}
        />

        <Controller
          control={control}
          name="coatColor"
          render={({ field: { onChange, value } }) => (
            <CustomTextInput
              label="Color del manto / pelo"
              placeholder="Negro y blanco"
              value={value}
              onChangeText={onChange}
              error={errors.coatColor?.message}
              required
              editable={!isLoading}
            />
          )}
        />

        <Controller
          control={control}
          name="allergies"
          render={({ field: { onChange, value } }) => (
            <CustomTextInput
              label="Alergias (separadas por coma)"
              placeholder="pollo, polen"
              value={value ?? ''}
              onChangeText={onChange}
              error={errors.allergies?.message}
              editable={!isLoading}
            />
          )}
        />

        <Controller
          control={control}
          name="vaccines"
          render={({ field: { onChange, value } }) => (
            <CustomTextInput
              label="Vacunas (separadas por coma)"
              placeholder="rabia, parvovirus"
              value={value ?? ''}
              onChangeText={onChange}
              error={errors.vaccines?.message}
              editable={!isLoading}
            />
          )}
        />

        <View style={{ marginTop: 12 }}>
          <Button
            title="Crear mascota"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            disabled={isLoading}
          />
        </View>
      </View>
      )}

      <View style={styles.listSection}>
        <Text style={styles.sectionTitle}>Mascotas registradas</Text>

        <CustomTextInput
          label="Buscar"
          placeholder="Nombre, raza o dueño..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {(() => {
          const q = searchQuery.trim().toLowerCase();
          const filtered = q
            ? pets.filter((p) => {
                const ownerName =
                  typeof p.ownerId === 'object' && p.ownerId !== null
                    ? (p.ownerId as { name?: string }).name || ''
                    : '';
                return (
                  p.name.toLowerCase().includes(q) ||
                  p.breed.toLowerCase().includes(q) ||
                  (p.coatColor || '').toLowerCase().includes(q) ||
                  ownerName.toLowerCase().includes(q)
                );
              })
            : pets;

          if (pets.length === 0) {
            return <Text style={styles.muted}>Aún no hay mascotas registradas.</Text>;
          }
          if (filtered.length === 0) {
            return <Text style={styles.muted}>No se encontraron resultados para "{searchQuery}".</Text>;
          }
          return filtered.map((pet) => {
            const ownerName =
              typeof pet.ownerId === 'object' && pet.ownerId !== null
                ? (pet.ownerId as { name?: string }).name
                : undefined;
            return (
              <View key={pet._id ?? pet.id} style={styles.petCard}>
                <Text style={styles.petName}>{pet.name}</Text>
                <Text style={styles.petDetail}>
                  {pet.breed} · {pet.age} año(s) · {pet.sex === 'female' ? 'Hembra' : 'Macho'} ·{' '}
                  {pet.weight} kg
                </Text>
                {ownerName && isStaff && (
                  <Text style={styles.petDetailMuted}>Dueño: {ownerName}</Text>
                )}
                {pet.coatColor && pet.coatColor !== 'Unknown' && (
                  <Text style={styles.petDetailMuted}>Manto: {pet.coatColor}</Text>
                )}
                {pet.allergies && pet.allergies.length > 0 && (
                  <Text style={styles.petDetailMuted}>Alergias: {pet.allergies.join(', ')}</Text>
                )}
                {pet.vaccines && pet.vaccines.length > 0 && (
                  <Text style={styles.petDetailMuted}>Vacunas: {pet.vaccines.join(', ')}</Text>
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
    marginBottom: 24,
  },
  listSection: { marginTop: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 12 },
  label: { fontSize: 14, fontWeight: '500', color: '#444', marginBottom: 8, marginTop: 4 },
  muted: { color: '#888', fontStyle: 'italic', marginBottom: 12 },
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
    borderLeftColor: '#BE185D',
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 12,
    borderRadius: 4,
  },
  successBoxText: { color: '#BE185D', fontSize: 14 },
  errorText: { color: '#d32f2f', fontSize: 12, marginBottom: 8 },
  clientList: { marginBottom: 16, gap: 8 },
  clientOption: {
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  clientOptionSelected: { borderColor: '#EC4899', backgroundColor: '#FCE7F3' },
  clientOptionText: { fontSize: 14, color: '#666' },
  clientOptionTextSelected: { color: '#BE185D', fontWeight: '600' },
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
  petCard: {
    backgroundColor: '#f5f5f5',
    padding: 14,
    borderRadius: 8,
    marginBottom: 10,
  },
  petName: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 4 },
  petDetail: { fontSize: 13, color: '#555' },
  petDetailMuted: { fontSize: 12, color: '#777', marginTop: 2 },
});

export default PetsListScreen;
