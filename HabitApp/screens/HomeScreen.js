import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import HabitItem from '../components/HabitItem';
import {
  getHabits,
  addHabit,
  toggleHabit,
  deleteHabit,
  getPreferences,
} from '../db/database';

export default function HomeScreen() {
  const [habits, setHabits]     = useState([]);
  const [input, setInput]       = useState('');
  const [theme, setTheme]       = useState('light');
  const [sortBy, setSortBy]     = useState('id');
  const [loading, setLoading]   = useState(true);

  const dark = theme === 'dark';

  // Recarga datos cada vez que la pantalla recibe el foco
  useFocusEffect(
    useCallback(() => {
      loadAll();
    }, [])
  );

  const loadAll = async () => {
    setLoading(true);
    try {
      const prefs = await getPreferences();
      if (prefs) {
        setTheme(prefs.theme);
        setSortBy(prefs.sortBy);
        const list = await getHabits(prefs.sortBy);
        setHabits(list);
      }
    } catch (e) {
      console.error('Error cargando datos:', e);
    } finally {
      setLoading(false);
    }
  };

  // ─── Crear hábito ───────────────────────────────────────────────────────────
  const handleAdd = async () => {
    const trimmed = input.trim();
    if (!trimmed) {
      Alert.alert('Campo vacío', 'Escribe el nombre del hábito.');
      return;
    }
    try {
      const newId = await addHabit(trimmed);
      setHabits((prev) => [...prev, { id: newId, name: trimmed, completed: 0 }]);
      setInput('');
    } catch (e) {
      Alert.alert('Error', 'No se pudo agregar el hábito.');
    }
  };

  // ─── Marcar/desmarcar ────────────────────────────────────────────────────────
  const handleToggle = async (id, newCompleted) => {
    try {
      await toggleHabit(id, newCompleted);
      setHabits((prev) =>
        prev.map((h) =>
          h.id === id ? { ...h, completed: newCompleted ? 1 : 0 } : h
        )
      );
    } catch (e) {
      Alert.alert('Error', 'No se pudo actualizar el hábito.');
    }
  };

  // ─── Eliminar ─────────────────────────────────────────────────────────────
  const handleDelete = (id) => {
    Alert.alert(
      'Eliminar hábito',
      '¿Estás seguro de que quieres eliminarlo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteHabit(id);
              setHabits((prev) => prev.filter((h) => h.id !== id));
            } catch (e) {
              Alert.alert('Error', 'No se pudo eliminar el hábito.');
            }
          },
        },
      ]
    );
  };

  // ─── Stats ─────────────────────────────────────────────────────────────────
  const completed = habits.filter((h) => h.completed).length;
  const total     = habits.length;
  const progress  = total > 0 ? (completed / total) * 100 : 0;

  // ─── Render ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={[styles.centered, dark ? styles.bgDark : styles.bgLight]}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.container, dark ? styles.bgDark : styles.bgLight]}>
        {/* ── Encabezado ── */}
        <View style={styles.header}>
          <Text style={[styles.title, dark ? styles.textDark : styles.textLight]}>
            Mis Hábitos
          </Text>
          <Text style={[styles.subtitle, dark ? styles.mutedDark : styles.mutedLight]}>
            {completed}/{total} completados
          </Text>
        </View>

        {/* ── Barra de progreso ── */}
        {total > 0 && (
          <View style={[styles.progressBar, dark ? styles.progressBgDark : styles.progressBgLight]}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        )}

        {/* ── Lista de hábitos ── */}
        <FlatList
          data={habits}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <HabitItem
              habit={item}
              theme={theme}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🌱</Text>
              <Text style={[styles.emptyText, dark ? styles.mutedDark : styles.mutedLight]}>
                Aún no tienes hábitos.{'\n'}¡Agrega uno abajo!
              </Text>
            </View>
          }
        />

        {/* ── Input para agregar ── */}
        <View
          style={[
            styles.inputRow,
            dark ? styles.inputContainerDark : styles.inputContainerLight,
          ]}
        >
          <TextInput
            style={[styles.input, dark ? styles.inputTextDark : styles.inputTextLight]}
            placeholder="Nuevo hábito..."
            placeholderTextColor={dark ? '#64748B' : '#94A3B8'}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleAdd}
            returnKeyType="done"
          />
          <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
            <Text style={styles.addBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  centered:   { flex: 1, justifyContent: 'center', alignItems: 'center' },
  bgLight:    { backgroundColor: '#F1F5F9' },
  bgDark:     { backgroundColor: '#0F0F1A' },

  // Encabezado
  header:     { marginBottom: 16 },
  title:      { fontSize: 28, fontWeight: '700', letterSpacing: -0.5 },
  subtitle:   { fontSize: 14, marginTop: 2 },
  textLight:  { color: '#0F172A' },
  textDark:   { color: '#F1F5F9' },
  mutedLight: { color: '#64748B' },
  mutedDark:  { color: '#64748B' },

  // Progreso
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: 20,
    overflow: 'hidden',
  },
  progressBgLight: { backgroundColor: '#E2E8F0' },
  progressBgDark:  { backgroundColor: '#1E293B' },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366F1',
    borderRadius: 3,
  },

  // Lista
  list: { paddingBottom: 20 },

  // Vacío
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyEmoji:     { fontSize: 48, marginBottom: 12 },
  emptyText:      { fontSize: 15, textAlign: 'center', lineHeight: 22 },

  // Input
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: Platform.OS === 'ios' ? 24 : 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  inputContainerLight: { backgroundColor: '#FFFFFF' },
  inputContainerDark:  { backgroundColor: '#1E1E2E' },
  input: {
    flex: 1,
    height: 44,
    fontSize: 15,
    paddingHorizontal: 8,
  },
  inputTextLight: { color: '#0F172A' },
  inputTextDark:  { color: '#E2E8F0' },

  addBtn: {
    backgroundColor: '#6366F1',
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: { color: '#FFFFFF', fontSize: 22, fontWeight: '600', lineHeight: 26 },
});