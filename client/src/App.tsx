import { usePlayerStore } from './store.ts';
import EntryScreen from './components/EntryScreen.tsx';

export default function App() {
  const joined = usePlayerStore((s) => s.joined);

  if (!joined) {
    return <EntryScreen />;
  }

  // 3D scene will be mounted here in future stories
  return <div>Scene placeholder</div>;
}
