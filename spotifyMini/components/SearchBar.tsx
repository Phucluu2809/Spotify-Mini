import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, TextInput, View, type ViewStyle } from 'react-native';

type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
  style?: ViewStyle;
};

export function SearchBar({ value, onChangeText, placeholder = 'Search...', onClear, style }: SearchBarProps) {
  return (
    <View style={[styles.container, style]}>
      <Ionicons name="search" size={18} color="#6B7280" style={styles.icon} />
      <TextInput
        value={value} onChangeText={onChangeText}
        placeholder={placeholder} placeholderTextColor="#6B7280"
        style={styles.input} autoCorrect={false} autoCapitalize="none"
      />
      {value.length > 0 && (
        <Pressable onPress={() => { onChangeText(''); onClear?.(); }} hitSlop={8} style={styles.clearButton}>
          <Ionicons name="close-circle" size={18} color="#6B7280" />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 48, borderRadius: 24, backgroundColor: '#1E2022',
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)'
  },
  icon: { marginRight: 8 },
  input: { flex: 1, color: '#FFFFFF', fontSize: 15 },
  clearButton: { marginLeft: 8 }
});