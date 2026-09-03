import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ChatScreen from './components/ChatScreen';
import HomeScreen from './components/HomeScreen';
import Layout from './components/Layout';
import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';

function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<HomeScreen />} />
              <Route path="/chat/:id" element={<ChatScreen />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ChatProvider>
    </AuthProvider>
  );
}

export default App;
