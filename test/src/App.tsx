import ChatScreen from './components/ChatScreen';

function App() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-200">
      <div className="w-full max-w-[393px] min-h-[852px] bg-[#e9e6e2] shadow-2xl overflow-hidden">
        <ChatScreen />
      </div>
    </div>
  );
}

export default App;
