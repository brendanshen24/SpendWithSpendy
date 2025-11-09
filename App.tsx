import { ScreenContent } from 'components/ScreenContent';
import { StatusBar } from 'expo-status-bar';
import NFCScanner from 'components/NFCScanner';

import './global.css';

export default function App() {
  return (
    <>
      <ScreenContent path="App.tsx">
        <NFCScanner />
      </ScreenContent>
      <StatusBar style="auto" />
    </>
  );
}
