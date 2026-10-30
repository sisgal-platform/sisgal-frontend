import { createBrowserRouter, RouterProvider } from "react-router";
import { AuthSync } from "./features/auth/components/AuthSync";
import { routes } from "./routes";
import { SessionProvider } from "./session/components/SessionProvider";
import { ToastProvider } from "./toast/components/ToastProvider";
import "./App.css";

const router = createBrowserRouter(routes);

function App() {
    return (
        <SessionProvider>
            <ToastProvider>
                <AuthSync />
                <RouterProvider router={router} />
            </ToastProvider>
        </SessionProvider>
    );
}

export default App;
