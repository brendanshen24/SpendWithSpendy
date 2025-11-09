import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import NfcManager, { NfcTech, Ndef, TagEvent } from 'react-native-nfc-manager';

// Helper to hex-encode a byte array without Buffer
function toHex(bytes: number[] | Uint8Array) {
  const arr = Array.from(bytes as any as number[]);
  return arr.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Utility to parse NDEF records into human-readable strings
function parseNdef(tag?: TagEvent) {
  try {
    const ndefRecords = tag?.ndefMessage;
    if (!ndefRecords || ndefRecords.length === 0) {
      return { hasNdef: false, records: [] as string[] };
    }
    const records: string[] = [];
    for (const rec of ndefRecords) {
      const { tnf, type, payload } = rec as any;
      // Try well-known text
      if (Ndef.isType(rec as any, Ndef.TNF_WELL_KNOWN, Ndef.RTD_TEXT)) {
        const text = Ndef.text.decodePayload(payload);
        records.push(`Text: ${text}`);
        continue;
      }
      // Try well-known URI
      if (Ndef.isType(rec as any, Ndef.TNF_WELL_KNOWN, Ndef.RTD_URI)) {
        const uri = Ndef.uri.decodePayload(payload);
        records.push(`URI: ${uri}`);
        continue;
      }
      // Fallback: show type (ASCII if possible) and payload hex
      let typeStr = '';
      try {
        typeStr = String.fromCharCode(...(type as number[]));
      } catch {
        typeStr = `0x${toHex(type as any)}`;
      }
      const payloadHex = `0x${toHex(payload as any)}`;
      records.push(`TNF ${tnf}, Type ${typeStr || 'unknown'}: ${payloadHex}`);
    }
    return { hasNdef: true, records };
  } catch {
    return { hasNdef: false, records: [] as string[] };
  }
}

function getTagType(tag?: TagEvent): string {
  if (!tag) return 'Unknown';
  // Android often provides techTypes array
  const androidTypes = (tag as any).techTypes as string[] | undefined;
  if (androidTypes && androidTypes.length) {
    return androidTypes.join(', ');
  }
  // iOS might provide type or additional fields
  // Common iOS types via Core NFC: Ndef, Mifare, IsoDep, Felica, Iso15693
  const iosType = (tag as any).type || ((tag as any).mifare ? 'MIFARE' : undefined);
  if (iosType) return String(iosType);
  // Fallback: if we have NDEF
  if ((tag as any).ndefMessage && (tag as any).ndefMessage.length > 0) return 'NDEF';
  return 'Unknown';
}

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

export const NFCScanner: React.FC = () => {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [enabled, setEnabled] = useState<boolean>(false);
  const [scanning, setScanning] = useState(false);
  const [tag, setTag] = useState<TagEvent | undefined>(undefined);

  useEffect(() => {
    // Init manager
    NfcManager.start().catch(() => {});
    NfcManager.isSupported().then(setSupported);
    if (Platform.OS === 'android') {
      NfcManager.isEnabled().then(setEnabled).catch(() => setEnabled(false));
    } else {
      // iOS doesn't expose enable state in same way
      setEnabled(true);
    }
  }, []);

  useEffect(() => {
    return () => {
      try { NfcManager.cancelTechnologyRequest().catch(() => {}); } catch {}
    };
  }, []);

  const ensureReady = useCallback(async () => {
    const isSupported = await NfcManager.isSupported();
    if (!isSupported) {
      Alert.alert('NFC not supported', 'This device does not support NFC.');
      return false;
    }
    if (Platform.OS === 'android') {
      const isEnabled = await NfcManager.isEnabled();
      if (!isEnabled) {
        Alert.alert(
          'NFC is disabled',
          'Please enable NFC in Settings to scan tags.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => NfcManager.goToNfcSetting() },
          ]
        );
        return false;
      }
    }
    return true;
  }, []);

  const startScan = useCallback(async () => {
    if (scanning) return;
    const ok = await ensureReady();
    if (!ok) return;

    setTag(undefined);
    setScanning(true);

    try {
      // Prefer NDEF, but also allow other techs to identify type
      await NfcManager.requestTechnology([
        NfcTech.Ndef,
        NfcTech.NfcA,
        NfcTech.NfcB,
        NfcTech.NfcF,
        NfcTech.NfcV,
        NfcTech.IsoDep,
      ] as any);

      // Wait for a tag
      const detectedTag = (await NfcManager.getTag()) as TagEvent | undefined;

      // If we requested Ndef, tag will include ndefMessage when present
      setTag(detectedTag);
    } catch (e: any) {
      if (e?.message && !/cancel/i.test(e.message)) {
        Alert.alert('NFC error', String(e.message || e));
      }
    } finally {
      setScanning(false);
      try { await NfcManager.cancelTechnologyRequest(); } catch {}
    }
  }, [ensureReady, scanning]);

  const tagType = useMemo(() => getTagType(tag), [tag]);
  const { hasNdef, records } = useMemo(() => parseNdef(tag), [tag]);

  return (
    <View className="w-11/12 max-w-xl items-stretch">
      <Text className="text-lg font-semibold mb-2">NFC Scanner</Text>
      <Text className="text-gray-700 mb-2">Platform: {Platform.OS.toUpperCase()}</Text>
      {supported === false && (
        <Text className="text-red-600 mb-2">This device does not support NFC.</Text>
      )}
      {Platform.OS === 'android' && !enabled && supported && (
        <Text className="text-orange-600 mb-2">NFC is turned off. Enable it in Settings to scan tags.</Text>
      )}

      <Button title={scanning ? 'Scanning…' : 'Start Scan'} onPress={startScan} disabled={(!!supported && Platform.OS === 'android' && !enabled) || scanning === true} />
      {scanning && (
        <Text className="text-gray-600 mb-2">Hold a tag near the device…</Text>
      )}

      {tag && (
        <View className="mt-4 p-3 rounded-md bg-gray-50 border border-gray-200">
          <Text className="font-semibold mb-1">Result</Text>
          <Text className="mb-1">Tag Type: <Text className="font-mono">{tagType}</Text></Text>
          {(tag as any)?.id ? (
            <Text className="mb-1">Tag ID: <Text className="font-mono">{(tag as any).id}</Text></Text>
          ) : null}
          <Text className="mb-1">Has NDEF: {hasNdef ? 'Yes' : 'No'}</Text>
          {records.length > 0 && (
            <View className="mt-2">
              <Text className="font-semibold">NDEF Records</Text>
              <ScrollView className="max-h-48 mt-1">
                {records.map((r, i) => (
                  <Text key={i} className="font-mono text-xs mb-1">• {r}</Text>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      )}

      <Text className="text-xs text-gray-500 mt-4">
        Notes: iOS NFC requires a physical device (not simulator). Some tag technologies may not be supported on all devices.
      </Text>
    </View>
  );
};

export default NFCScanner;
