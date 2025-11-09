import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import NfcManager, { NfcEvents } from 'react-native-nfc-manager';

const Button = ({ title, onPress, disabled }: { title: string; onPress: () => void; disabled?: boolean }) => (
  <Pressable
    accessibilityRole="button"
    onPress={onPress}
    disabled={disabled}
    className={`px-4 py-2 rounded-md my-2 ${disabled ? 'bg-gray-300' : 'bg-blue-600'}`}
  >
    <Text className="text-white font-semibold">{title}</Text>
  </Pressable>
);

export const NFCScanner: React.FC<{ onTagDetected?: () => void }> = ({ onTagDetected }) => {
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    NfcManager.start();
    
    return () => {
      try {
        NfcManager.cancelTechnologyRequest();
        NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
      } catch {}
    };
  }, []);

  const startScan = useCallback(async () => {
    if (scanning) return;
    setScanning(true);

    try {
      if (Platform.OS === 'ios') {
        await NfcManager.registerTagEvent({
          alertMessage: 'Tap Spendy!'
        });
        
        await new Promise<void>((resolve) => {
          NfcManager.setEventListener(NfcEvents.DiscoverTag, () => {
            onTagDetected?.();
            resolve();
          });
        });
      } else {
        // On Android, just detect any tag
        await NfcManager.requestTechnology(['android.nfc.tech.IsoDep' as any]);
        onTagDetected?.();
      }

    } catch (e: any) {
      // Only show error if it's not a cancel
      if (e?.message && !/cancel/i.test(e.message)) {
        Alert.alert('NFC Error', String(e.message));
      }
    } finally {
      setScanning(false);
      try { await NfcManager.cancelTechnologyRequest(); } catch {}
    }
  }, [scanning, onTagDetected]);

  return (
    <View className="items-center">
      <Button 
        title={scanning ? 'Scanning...' : 'Tap to Scan'} 
        onPress={startScan} 
        disabled={scanning} 
      />
    </View>
  );
};

export default NFCScanner;
