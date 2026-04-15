import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';

/**
 * HabitItem
 * Props:
 *  - habit   : { id, name, completed }
 *  - theme   : 'light' | 'dark'
 *  - onToggle: (id, newCompletedBool) => void
 *  - onDelete: (id) => void
 */
export default function HabitItem({ habit, theme, onToggle, onDelete }) {
  const dark = theme === 'dark';
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Pequeña animación al tocar el checkbox
  const animateTap = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.93,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleToggle = () => {
    animateTap();
    onToggle(habit.id, !habit.completed);
  };

  return (
    <Animated.View
      style={[
        styles.card,
        dark ? styles.cardDark : styles.cardLight,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      {/* Checkbox */}
      <TouchableOpacity onPress={handleToggle} style={styles.checkboxArea}>
        <View
          style={[
            styles.checkbox,
            habit.completed
              ? styles.checkboxDone
              : dark
              ? styles.checkboxEmptyDark
              : styles.checkboxEmpty,
          ]}
        >
          {habit.completed && <Text style={styles.checkmark}>✓</Text>}
        </View>
      </TouchableOpacity>

      {/* Nombre del hábito */}
      <Text
        style={[
          styles.habitName,
          dark ? styles.textDark : styles.textLight,
          habit.completed && styles.habitNameDone,
        ]}
        numberOfLines={2}
      >
        {habit.name}
      </Text>

      {/* Botón eliminar */}
      <TouchableOpacity
        onPress={() => onDelete(habit.id)}
        style={styles.deleteBtn}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={styles.deleteIcon}>✕</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  cardLight: {
    backgroundColor: '#FFFFFF',
  },
  cardDark: {
    backgroundColor: '#1E1E2E',
  },

  checkboxArea: {
    marginRight: 14,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  checkboxEmpty: {
    borderColor: '#CBD5E1',
  },
  checkboxEmptyDark: {
    borderColor: '#475569',
  },
  checkboxDone: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  habitName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 20,
  },
  textLight: {
    color: '#1E293B',
  },
  textDark: {
    color: '#E2E8F0',
  },
  habitNameDone: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },

  deleteBtn: {
    marginLeft: 12,
    padding: 4,
  },
  deleteIcon: {
    fontSize: 14,
    color: '#94A3B8',
  },
});