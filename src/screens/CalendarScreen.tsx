import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { Calendar, DateData } from 'react-native-calendars';
import { useAppSelector } from '@hooks/index';
import { ordersService } from '@services/index';
import { Order, OrderStatus, Pet } from '@definitions/index';
import { DatePicker, TimePicker } from '@components/DateTimePicker';
import Button from '@components/Button';

const SERVICE_LABELS: Record<string, string> = {
  bath: 'Baño',
  breed_cut: 'Corte de raza',
  nails: 'Corte de uñas',
  ear_cleaning: 'Limpieza de oídos',
  de_shedding: 'Deslanado',
  hygienic_cut: 'Higiénico',
  grooming: 'Grooming',
  haircut: 'Haircut',
  other: 'Otro',
};

const STATUS_OPTIONS: OrderStatus[] = [
  'pending',
  'confirmed',
  'picked_up',
  'in_service',
  'completed',
  'delivered',
  'cancelled',
];

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  picked_up: 'Recogido',
  in_service: 'En servicio',
  completed: 'Completado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

const formatDateKey = (iso: string): string => {
  // Returns YYYY-MM-DD in local time
  const d = new Date(iso);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const formatTime = (iso: string): string => {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
};

const toLocalDateInput = (iso: string): string => {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const toLocalTimeInput = (iso: string): string => {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const CalendarScreen: React.FC = () => {
  const currentUser = useAppSelector((state) => state.auth.user);
  const isStaff = currentUser?.role === 'staff';
  const canEdit = isStaff;

  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(formatDateKey(new Date().toISOString()));
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState<string>('');
  const [editTime, setEditTime] = useState<string>('');
  const [editStatus, setEditStatus] = useState<OrderStatus>('pending');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const result = await ordersService.getOrders();
      setOrders(result);
    } catch (e) {
      const generic = 'No se pudieron cargar las citas.';
      setError(generic);
      Alert.alert('Error', generic);
      // eslint-disable-next-line no-console
      console.warn('Load orders error:', (e as { message?: string })?.message);
    }
  };

  const ordersByDate = useMemo(() => {
    const acc: Record<string, Order[]> = {};
    for (const o of orders) {
      const key = formatDateKey(o.pickupDateTime);
      if (!acc[key]) acc[key] = [];
      acc[key].push(o);
    }
    return acc;
  }, [orders]);

  const markedDates = useMemo(() => {
    const marks: Record<string, { marked?: boolean; dotColor?: string; selected?: boolean; selectedColor?: string }> = {};
    Object.keys(ordersByDate).forEach((d) => {
      marks[d] = { marked: true, dotColor: '#EC4899' };
    });
    if (selectedDate) {
      marks[selectedDate] = { ...(marks[selectedDate] || {}), selected: true, selectedColor: '#EC4899' };
    }
    return marks;
  }, [ordersByDate, selectedDate]);

  const handleDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
    setEditingOrderId(null);
  };

  const startEditing = (order: Order) => {
    const id = (order._id ?? order.id) as string;
    setEditingOrderId(id);
    setEditDate(toLocalDateInput(order.pickupDateTime));
    setEditTime(toLocalTimeInput(order.pickupDateTime));
    setEditStatus(order.status);
    setError(null);
  };

  const cancelEditing = () => {
    setEditingOrderId(null);
    setError(null);
  };

  const dayOrders = ordersByDate[selectedDate] || [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Calendario de citas</Text>

      <View style={styles.calendarWrapper}>
        <Calendar
          onDayPress={handleDayPress}
          markedDates={markedDates}
          theme={{
            todayTextColor: '#EC4899',
            arrowColor: '#EC4899',
            selectedDayBackgroundColor: '#EC4899',
          }}
        />
      </View>

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorBoxText}>{error}</Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>
        {selectedDate ? `Citas del ${selectedDate}` : 'Selecciona un día'}
      </Text>

      {dayOrders.length === 0 ? (
        <Text style={styles.muted}>No hay citas en este día.</Text>
      ) : (
        dayOrders.map((order) => {
          const id = (order._id ?? order.id) as string;
          const petName =
            typeof order.petId === 'object' && order.petId !== null
              ? (order.petId as Pet).name
              : 'Mascota';
          const isEditing = editingOrderId === id;

          return (
            <View key={id} style={styles.orderCard}>
              <Text style={styles.orderTitle}>
                {petName} · {formatTime(order.pickupDateTime)}
              </Text>
              <Text style={styles.orderMeta}>
                Estado: {STATUS_LABELS[order.status] || order.status}
              </Text>
              <Text style={styles.orderMeta}>
                Servicios: {order.services.map((s) => SERVICE_LABELS[s] || s).join(', ')}
              </Text>
              {order.coatCondition && (
                <Text style={styles.orderMetaMuted}>Manto: {order.coatCondition}</Text>
              )}
              {order.notes && <Text style={styles.orderMetaMuted}>Notas: {order.notes}</Text>}

              {canEdit && !isEditing && (
                <View style={{ marginTop: 10 }}>
                  <Button title="Editar" variant="secondary" onPress={() => startEditing(order)} />
                </View>
              )}

              {canEdit && isEditing && (
                <View style={styles.editBlock}>
                  <View style={styles.dateTimeRow}>
                    <View style={{ flex: 1 }}>
                      <DatePicker
                        label="Nueva fecha"
                        value={editDate}
                        onChange={setEditDate}
                      />
                    </View>
                    <View style={{ width: 12 }} />
                    <View style={{ flex: 1 }}>
                      <TimePicker
                        label="Nueva hora"
                        value={editTime}
                        onChange={setEditTime}
                      />
                    </View>
                  </View>

                  <Text style={styles.label}>Estado</Text>
                  <View style={styles.statusList}>
                    {STATUS_OPTIONS.map((s) => (
                      <Pressable
                        key={s}
                        onPress={() => setEditStatus(s)}
                        style={[
                          styles.statusOption,
                          editStatus === s && styles.statusOptionSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusOptionText,
                            editStatus === s && styles.statusOptionTextSelected,
                          ]}
                        >
                          {STATUS_LABELS[s]}
                        </Text>
                      </Pressable>
                    ))}
                  </View>

                  <View style={styles.editActions}>
                    <View style={{ flex: 1 }}>
                      <Button
                        title="Guardar"
                        loading={isSaving}
                        disabled={isSaving}
                        onPress={async () => {
                          setIsSaving(true);
                          setError(null);
                          try {
                            if (!editDate || !editTime) {
                              setError('Seleccioná fecha y hora');
                              return;
                            }
                            const newPickup = new Date(`${editDate}T${editTime}:00`);
                            if (Number.isNaN(newPickup.getTime())) {
                              setError('Fecha u hora inválida');
                              return;
                            }
                            const newCompletion = new Date(
                              newPickup.getTime() + 2 * 60 * 60 * 1000
                            );
                            await ordersService.updateOrder(id, {
                              pickupDateTime: newPickup.toISOString(),
                              estimatedCompletionTime: newCompletion.toISOString(),
                              status: editStatus,
                            });
                            await loadOrders();
                            setSelectedDate(formatDateKey(newPickup.toISOString()));
                            setEditingOrderId(null);
                          } catch (e) {
                            const generic = 'No se pudo guardar los cambios.';
                            setError(generic);
                            Alert.alert('Error', generic);
                            // eslint-disable-next-line no-console
                            console.warn('Save edit error:', (e as { message?: string })?.message);
                          } finally {
                            setIsSaving(false);
                          }
                        }}
                      />
                    </View>
                    <View style={{ width: 10 }} />
                    <View style={{ flex: 1 }}>
                      <Button
                        title="Cancelar"
                        variant="secondary"
                        onPress={cancelEditing}
                      />
                    </View>
                  </View>
                </View>
              )}
            </View>
          );
        })
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  calendarWrapper: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 12, marginTop: 8 },
  label: { fontSize: 14, fontWeight: '500', color: '#444', marginBottom: 8, marginTop: 8 },
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
  orderCard: {
    backgroundColor: '#f5f5f5',
    padding: 14,
    borderRadius: 8,
    marginBottom: 10,
  },
  orderTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
  orderMeta: { fontSize: 13, color: '#555', marginTop: 2 },
  orderMetaMuted: { fontSize: 12, color: '#777', marginTop: 2 },
  editBlock: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  statusList: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  statusOption: {
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  statusOptionSelected: { borderColor: '#EC4899', backgroundColor: '#FCE7F3' },
  statusOptionText: { fontSize: 12, color: '#666' },
  statusOptionTextSelected: { color: '#BE185D', fontWeight: '600' },
  editActions: { flexDirection: 'row', marginTop: 8 },
  dateTimeRow: { flexDirection: 'row', alignItems: 'flex-start' },
});

export default CalendarScreen;
