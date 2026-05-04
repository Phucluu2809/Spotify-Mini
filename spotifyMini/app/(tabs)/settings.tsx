import { View, Text } from 'react-native';

export default function SettingsScreen() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <Text style={{ color: 'white', fontSize: 20 }}>
        Settings Screen
      </Text>
    </View>
  );
}