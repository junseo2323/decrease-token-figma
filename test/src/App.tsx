import DashboardScreen from './components/DashboardScreen';

function App() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-200">
      <div className="w-[1024px] h-[761px] shadow-2xl overflow-hidden">
        <DashboardScreen />
      </div>
    </div>
  );
}

export default App;
