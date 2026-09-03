import { Outlet } from 'react-router';
import { Nav } from './components/Nav';

function App() {
  return (
    <div className="d-flex">
      <Nav />
      <div className="text-center pt-4 flex-grow-1">
        <Outlet />
      </div>
    </div>
  )
}

export default App
