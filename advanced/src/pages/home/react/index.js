import { createRoot } from 'react-dom/client';

const entry = document.getElementById('react-cmp');

if (entry) {
  const root = createRoot(entry);
  root.render(<h1>Hello from React Component!</h1>);
}