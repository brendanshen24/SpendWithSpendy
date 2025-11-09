import { ScreenContent } from 'components/ScreenContent';
import { StatusBar } from 'expo-status-bar';
import NFCScanner from 'components/NFCScanner';

import './global.css';

export default function App() {
  return (
    <>
      <ScreenContent title="Home" path="App.tsx">
        <NFCScanner />
      </ScreenContent>
      <StatusBar style="auto" />
    </>
  );
}
