import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppSelector } from '@hooks/index';
import { petsService, ordersService, usersService } from '@services/index';
import { Pet, Order, ServiceType, Client } from '@definitions/index';
import CustomTextInput from '@components/TextInput';
import { DatePicker, TimePicker } from '@components/DateTimePicker';
import Button from '@components/Button';

const SERVICE_OPTIONS: Array<{ label: string; value: ServiceType }> = [
  { label: 'Baño', value: 'bath' },
  { label: 'Corte de raza', value: 'breed_cut' },
  { label: 'Corte de uñas', value: 'nails' },
  { label: 'Limpieza de oídos', value: 'ear_cleaning' },
  { label: 'Deslanado', value: 'de_shedding' },
  { label: 'Higiénico', value: 'hygienic_cut' },
];

const SERVICE_LABELS: Record<string, string> = SERVICE_OPTIONS.reduce(
  (acc, o) => ({ ...acc, [o.value]: o.label }),
  {}
);

const orderSchema = z.object({
  ownerId: z.string().optional(),
  petId: z.string().min(1, 'Mascota requerida'),
  pickupDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha requerida'),
  pickupTime: z.string().regex(/^\d{2}:\d{2}$/, 'Hora requerida'),
  services: z.array(z.string()).min(1, 'Seleccioná al menos un servicio'),
  coatCondition: z.string().min(1, 'Estado del manto requerido'),
  notes: z.string().optional(),
});

type OrderFormData = z.infer<typeof orderSchema>;

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
};

const OrdersListScreen: React.FC = () => {
  const currentUser = useAppSelector((state) => state.auth.user);
  const isStaff = currentUser?.role === 'staff';
  const canCreate = isStaff;

  // Owner sees only their orders, staff sees all → backend handles role filter.
  // For staff: client picker required to pick a pet from that client's pets.
  const [pets, setPets] = useState<Pet[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [selectedServices, setSelectedServices] = useState<ServiceType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [generalSuccess, setGeneralSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      ownerId: '',
      petId: '',
      pickupDate: '',
      pickupTime: '',
      services: [],
      coatCondition: '',
      notes: '',
    },
  });

  useFocusEffect(
    useCallback(() => {
      loadOrders();
      if (isStaff) {
        loadClients();
      } else {
        loadOwnPets();
      }
    }, [isStaff])
  );

  const loadOrders = async () => {
    try {
      const result = await ordersService.getOrders();
      setOrders(result);
    } catch {
      // ignore
    }
  };

  const loadOwnPets = async () => {
    try {
      const result = await petsService.getPets();
      setPets(result);
    } catch {
      // ignore
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

  const loadClientPets = async (clientId: string) => {
    try {
      const result = await petsService.getPets(clientId);
      setPets(result);
    } catch {
      setPets([]);
    }
  };

  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId);
    setValue('ownerId', clientId);
    setSelectedPetId(null);
    setValue('petId', '');
    loadClientPets(clientId);
  };

  const handlePetSelect = (petId: string) => {
    setSelectedPetId(petId);
    setValue('petId', petId);
  };

  const toggleService = (service: ServiceType) => {
    const next = selectedServices.includes(service)
      ? selectedServices.filter((s) => s !== service)
      : [...selectedServices, service];
    setSelectedServices(next);
    setValue('services', next);
  };

  const onSubmit = async (data: OrderFormData) => {
    setIsLoading(true);
    setGeneralError(null);
    setGeneralSuccess(null);

    try {
      const pickupDt = new Date(`${data.pickupDate}T${data.pickupTime}:00`);
      if (Number.isNaN(pickupDt.getTime())) {
        throw new Error('Fecha y hora inválidas');
      }
      const estimatedCompletion = new Date(pickupDt.getTime() + 2 * 60 * 60 * 1000);

      const created = await ordersService.createOrder({
        petId: data.petId,
        services: data.services,
        requirements: {},
        pickupDateTime: pickupDt.toISOString(),
        estimatedCompletionTime: estimatedCompletion.toISOString(),
        coatCondition: data.coatCondition,
        notes: data.notes,
        ...(isStaff && data.ownerId ? { ownerId: data.ownerId } : {}),
      } as Parameters<typeof ordersService.createOrder>[0]);
      setOrders((prev) => [created, ...prev]);
      setGeneralSuccess('Servicio creado correctamente');
      reset();
      setSelectedClientId(null);
      setSelectedPetId(null);
      setSelectedServices([]);
      if (isStaff) setPets([]);
      setShowForm(false);
    } catch (error) {
      const generic = 'No se pudo crear el servicio. Verificá los datos e intentá de nuevo.';
      setGeneralError(generic);
      Alert.alert('Error', generic);
      // eslint-disable-next-line no-console
      console.warn('Create order error:', (error as { message?: string })?.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Servicios</Text>

      {canCreate && (
        <View style={{ marginBottom: 16 }}>
          <Button
            title={showForm ? 'Cancelar' : '+ Crear nuevo servicio'}
            variant={showForm ? 'secondary' : 'primary'}
            onPress={() => setShowForm((v) => !v)}
          />
        </View>
      )}

      {canCreate && showForm && (
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Solicitar nuevo servicio</Text>

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
              <Text style={styles.label}>Cliente *</Text>
              {clients.length === 0 ? (
                <Text style={styles.muted}>No hay clientes registrados aún.</Text>
              ) : (
                <View style={styles.optionList}>
                  {clients.map((c) => (
                    <Pressable
                      key={c._id}
                      onPress={() => handleClientSelect(c._id)}
                      style={[
                        styles.option,
                        selectedClientId === c._id && styles.optionSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          selectedClientId === c._id && styles.optionTextSelected,
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

          <Text style={styles.label}>Mascota *</Text>
          {pets.length === 0 ? (
            <Text style={styles.muted}>
              {isStaff
                ? 'Selecciona un cliente para ver sus mascotas.'
                : 'Aún no tienes mascotas registradas.'}
            </Text>
          ) : (
            <View style={styles.optionList}>
              {pets.map((p) => (
                <Pressable
                  key={p._id ?? p.id}
                  onPress={() => handlePetSelect((p._id ?? p.id) as string)}
                  style={[
                    styles.option,
                    selectedPetId === (p._id ?? p.id) && styles.optionSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selectedPetId === (p._id ?? p.id) && styles.optionTextSelected,
                    ]}
                  >
                    {p.name} · {p.breed}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
          {errors.petId && <Text style={styles.errorText}>{errors.petId.message}</Text>}

          <View style={styles.dateTimeRow}>
            <View style={{ flex: 1 }}>
              <Controller
                control={control}
                name="pickupDate"
                render={({ field: { onChange, value } }) => (
                  <DatePicker
                    label="Fecha del servicio"
                    value={value}
                    onChange={onChange}
                    error={errors.pickupDate?.message}
                    required
                  />
                )}
              />
            </View>
            <View style={{ width: 12 }} />
            <View style={{ flex: 1 }}>
              <Controller
                control={control}
                name="pickupTime"
                render={({ field: { onChange, value } }) => (
                  <TimePicker
                    label="Hora"
                    value={value}
                    onChange={onChange}
                    error={errors.pickupTime?.message}
                    required
                  />
                )}
              />
            </View>
          </View>

          <Text style={styles.label}>Servicios solicitados *</Text>
          <View style={styles.serviceList}>
            {SERVICE_OPTIONS.map((option) => {
              const isSelected = selectedServices.includes(option.value);
              return (
                <Pressable
                  key={option.value}
                  onPress={() => toggleService(option.value)}
                  style={[styles.serviceOption, isSelected && styles.optionSelected]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      isSelected && styles.optionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {errors.services && (
            <Text style={styles.errorText}>{errors.services.message as string}</Text>
          )}

          <Controller
            control={control}
            name="coatCondition"
            render={({ field: { onChange, value } }) => (
              <CustomTextInput
                label="Estado del manto"
                placeholder="Pelo con muchos nudos, enredado en las patas..."
                value={value}
                onChangeText={onChange}
                error={errors.coatCondition?.message}
                required
                editable={!isLoading}
              />
            )}
          />

          <Controller
            control={control}
            name="notes"
            render={({ field: { onChange, value } }) => (
              <CustomTextInput
                label="Notas adicionales"
                placeholder="Cualquier indicación extra"
                value={value ?? ''}
                onChangeText={onChange}
                error={errors.notes?.message}
                editable={!isLoading}
              />
            )}
          />

          <View style={{ marginTop: 12 }}>
            <Button
              title="Crear servicio"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              disabled={isLoading}
            />
          </View>
        </View>
      )}

      <View style={styles.listSection}>
        <Text style={styles.sectionTitle}>
          {isStaff ? 'Todas las citas' : 'Mis citas'}
        </Text>
        {orders.length === 0 ? (
          <Text style={styles.muted}>Aún no hay citas registradas.</Text>
        ) : (
          orders.map((order) => {
            const petName =
              typeof order.petId === 'object' && order.petId !== null
                ? (order.petId as Pet).name
                : 'Mascota';
            return (
              <View key={order._id ?? order.id} style={styles.orderCard}>
                <Text style={styles.orderTitle}>{petName}</Text>
                <Text style={styles.orderMeta}>
                  {formatDate(order.pickupDateTime)} · Estado: {order.status}
                </Text>
                <Text style={styles.orderMeta}>
                  Servicios:{' '}
                  {order.services.map((s) => SERVICE_LABELS[s] || s).join(', ')}
                </Text>
                {order.coatCondition && (
                  <Text style={styles.orderMetaMuted}>Manto: {order.coatCondition}</Text>
                )}
                {order.notes && (
                  <Text style={styles.orderMetaMuted}>Notas: {order.notes}</Text>
                )}
              </View>
            );
          })
        )}
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
  optionList: { gap: 8, marginBottom: 12 },
  dateTimeRow: { flexDirection: 'row', alignItems: 'flex-start' },
  option: {
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  optionSelected: { borderColor: '#EC4899', backgroundColor: '#FCE7F3' },
  optionText: { fontSize: 14, color: '#666' },
  optionTextSelected: { color: '#BE185D', fontWeight: '600' },
  serviceList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  serviceOption: {
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  orderCard: {
    backgroundColor: '#f5f5f5',
    padding: 14,
    borderRadius: 8,
    marginBottom: 10,
  },
  orderTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
  orderMeta: { fontSize: 13, color: '#555', marginTop: 2 },
  orderMetaMuted: { fontSize: 12, color: '#777', marginTop: 2 },
});

export default OrdersListScreen;
