import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { getPreferences, updatePreference } from '../db/database';

const SORT_OPTIONS = [
  { label: 'Por ID (orden de creación)', value: 'id' },
  { label: 'Por nombre (A-Z)', value: 'name' },
  { label: 'Por estado (pendientes primero)', value: 'completed' },
];

export default function SettingsScreen() {
  const [theme, setTheme]           = useState('light');
  const [showAlerts, setShowAlerts] = useState(true);
  const [sortBy, setSortBy]         = useState('id');
  const [saving, setSaving]         = useState(false);

  const dark = theme === 'dark';

  useFocusEffect(
    useCallback(() => {
      loadPrefs();
    }, [])
  );

  const loadPrefs = async () => {
    try {
      const prefs = await getPreferences();
      if (prefs) {
        setTheme(prefs.theme);
        setShowAlerts(prefs.showAlerts === 1);
        setSortBy(prefs.sortBy);
      }
    } catch (e) {
      console.error('Error cargando preferencias:', e);
    }
  };

  const handleThemeChange = async (value) => {
    const newTheme = value ? 'dark' : 'light';
    setTheme(newTheme);
    await save('theme', newTheme);
  };

  const handleAlertsChange = async (value) => {
    setShowAlerts(value);
    await save('showAlerts', value ? 1 : 0);
  };

  const handleSortChange = async (value) => {
    setSortBy(value);
    await save('sortBy', value);
  };

  const save = async (key, value) => {
    setSaving(true);
    try {
      await updatePreference(key, value);
    } catch (e) {
      Alert.alert('Error', 'No se pudo guardar la preferencia.');
    } finally {
      setSaving(false);
    }
  };

  // ─── Colores según tema ───────────────────────────────────────────────────
  const bg       = dark ? '#0F0F1A' : '#F1F5F9';
  const card     = dark ? '#1E1E2E' : '#FFFFFF';
  const text     = dark ? '#F1F5F9' : '#0F172A';
  const muted    = dark ? '#64748B' : '#94A3B8';
  const border   = dark ? '#2D2D3F' : '#E2E8F0';
  const selected = '#6366F1';

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: bg }}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.pageTitle, { color: text }]}>Configuración</Text>

      {/* ── Apariencia ── */}
      <SectionLabel label="APARIENCIA" color={muted} />
      <View style={[styles.card, { backgroundColor: card, borderColor: border }]}>
        <RowItem label="Tema oscuro" color={text}>
          <Switch
            value={dark}
            onValueChange={handleThemeChange}
            trackColor={{ false: '#CBD5E1', true: '#6366F1' }}
            thumbColor="#FFFFFF"
          />
        </RowItem>
      </View>

      {/* ── Notificaciones ── */}
      <SectionLabel label="NOTIFICACIONES" color={muted} />
      <View style={[styles.card, { backgroundColor: card, borderColor: border }]}>
        <RowItem label="Mostrar alertas" color={text}>
          <Switch
            value={showAlerts}
            onValueChange={handleAlertsChange}
            trackColor={{ false: '#CBD5E1', true: '#6366F1' }}
            thumbColor="#FFFFFF"
          />
        </RowItem>
      </View>

      {/* ── Ordenar por ── */}
      <SectionLabel label="ORDENAR HÁBITOS" color={muted} />
      <View style={[styles.card, { backgroundColor: card, borderColor: border }]}>
        {SORT_OPTIONS.map((opt, idx) => (
          <TouchableOpacity
            key={opt.value}
            onPress={() => handleSortChange(opt.value)}
            style={[
              styles.sortRow,
              idx < SORT_OPTIONS.length - 1 && { borderBottomWidth: 1, borderBottomColor: border },
            ]}
          >
            <Text style={[styles.sortLabel, { color: text }]}>{opt.label}</Text>
            <View
              style={[
                styles.radio,
                { borderColor: sortBy === opt.value ? selected : border },
              ]}
            >
              {sortBy === opt.value && (
                <View style={[styles.radioDot, { backgroundColor: selected }]} />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Indicador de guardado */}
      {saving && (
        <Text style={[styles.savingText, { color: muted }]}>Guardando...</Text>
      )}

      {/* ── Info ── */}
      <SectionLabel label="ACERCA DE" color={muted} />
      <View style={[styles.card, { backgroundColor: card, borderColor: border }]}>
        <RowItem label="Versión" color={text}>
          <Text style={{ color: muted, fontSize: 14 }}>1.0.0</Text>
        </RowItem>
        <View style={{ height: 1, backgroundColor: border }} />
        <RowItem label="Base de datos" color={text}>
          <Text style={{ color: muted, fontSize: 14 }}>SQLite (Expo)</Text>
        </RowItem>
      </View>
    </ScrollView>
  );
}

// ─── Sub-componentes ────────────────────────────────────────────────────────

function SectionLabel({ label, color }) {
  return (
    <Text style={[styles.sectionLabel, { color }]}>{label}</Text>
  );
}

function RowItem({ label, color, children }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, { color }]}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 8,
    marginTop: 20,
    marginLeft: 4,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '500',
  },

  // Sort
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  sortLabel: {
    fontSize: 14,
    flex: 1,
    marginRight: 12,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  savingText: {
    textAlign: 'center',
    fontSize: 13,
    marginTop: 10,
  },
});