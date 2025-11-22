import React from "react";
import AppRoutes from "./routes/AppRoutes";
import { AuthContextProvider } from "./context/AuthContext";
import { UserContextProvider } from "./context/UserContext";

function App() {
  return (
    <UserContextProvider>
      <AuthContextProvider>
        <div className="App">
          <AppRoutes />
        </div>
      </AuthContextProvider>
    </UserContextProvider>
  );
}

export default App;
