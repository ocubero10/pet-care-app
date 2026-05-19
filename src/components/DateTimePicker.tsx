import React from 'react';
import { View, StyleSheet, Platform, TextInput as RNTextInput } from 'react-native';
import { Text } from 'react-native-paper';

interface DateInputProps {
  label?: string;
  value: string; // YYYY-MM-DD
  onChange: (v: string) => void;
  error?: string;
  required?: boolean;
  min?: string; // YYYY-MM-DD
}

interface TimeInputProps {
  label?: string;
  value: string; // HH:MM (24h)
  onChange: (v: string) => void;
  error?: string;
  required?: boolean;
}

const Field: React.FC<{
  label?: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}> = ({ label, required, error, children }) => (
  <View style={styles.container}>
    {label && (
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}>*</Text>}
      </Text>
    )}
    {children}
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

// On web we render a native HTML input via React.createElement so we get
// the browser's calendar / clock pickers without pulling in a heavy library.
// On native we fall back to a plain TextInput (the user types YYYY-MM-DD / HH:MM).

export const DatePicker: React.FC<DateInputProps> = ({
  label,
  value,
  onChange,
  error,
  required,
  min,
}) => {
  if (Platform.OS === 'web') {
    return (
      <Field label={label} required={required} error={error}>
        {React.createElement('input', {
          type: 'date',
          value,
          min,
          onChange: (e: { target: { value: string } }) => onChange(e.target.value),
          style: webInputStyle(!!error),
        })}
      </Field>
    );
  }
  return (
    <Field label={label} required={required} error={error}>
      <RNTextInput
        style={[styles.nativeInput, error ? styles.inputError : null]}
        value={value}
        onChangeText={onChange}
        placeholder="YYYY-MM-DD"
        placeholderTextColor="#999"
      />
    </Field>
  );
};

export const TimePicker: React.FC<TimeInputProps> = ({
  label,
  value,
  onChange,
  error,
  required,
}) => {
  if (Platform.OS === 'web') {
    return (
      <Field label={label} required={required} error={error}>
        {React.createElement('input', {
          type: 'time',
          value,
          step: 900, // 15-minute increments
          onChange: (e: { target: { value: string } }) => onChange(e.target.value),
          style: webInputStyle(!!error),
        })}
      </Field>
    );
  }
  return (
    <Field label={label} required={required} error={error}>
      <RNTextInput
        style={[styles.nativeInput, error ? styles.inputError : null]}
        value={value}
        onChangeText={onChange}
        placeholder="HH:MM"
        placeholderTextColor="#999"
      />
    </Field>
  );
};

const webInputStyle = (hasError: boolean): React.CSSProperties => ({
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: hasError ? '#d32f2f' : '#ddd',
  borderRadius: 8,
  paddingLeft: 12,
  paddingRight: 12,
  paddingTop: 10,
  paddingBottom: 10,
  fontSize: 16,
  color: '#333',
  backgroundColor: '#fff',
  fontFamily: 'inherit',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
});

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
  required: { color: '#d32f2f' },
  errorText: { color: '#d32f2f', fontSize: 12, marginTop: 4 },
  nativeInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  inputError: { borderColor: '#d32f2f' },
});
