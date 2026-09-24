import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'

// No StrictMode: its simulated unmount would run the scene's GPU disposal
// (materials/textures are module-level singletons) and leave dangling references.
createRoot(document.getElementById('root')).render(<App />)
