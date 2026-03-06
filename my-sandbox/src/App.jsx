import { Toaster } from "react-hot-toast";
import AppRoutes from "./routes/AppRoutes";

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        containerStyle={{ zIndex: 9999 }}
        toastOptions={{
          duration: 4000,
          style: {
            background: "#071a12",
            color: "#e8fff6",
            fontFamily: "monospace",
            fontSize: "13px",
            padding: "12px 16px",
            borderRadius: "12px",
            boxShadow: "0 0 0 1px #0d3324, 0 8px 32px rgba(0,0,0,0.5)",
            maxWidth: "360px",
          },
          success: {
            iconTheme: {
              primary: "#00ffb4",
              secondary: "#020b08",
            },
            style: {
              background: "#071a12",
              color: "#e8fff6",
              fontFamily: "monospace",
              fontSize: "13px",
              padding: "12px 16px",
              borderRadius: "12px",
              boxShadow: "0 0 0 1px #00ffb455, 0 8px 32px rgba(0,255,180,0.1)",
            },
          },
          loading: {
            iconTheme: {
              primary: "#00ffb4",
              secondary: "#0d3324",
            },
            style: {
              background: "#071a12",
              color: "#e8fff6",
              fontFamily: "monospace",
              fontSize: "13px",
              padding: "12px 16px",
              borderRadius: "12px",
              boxShadow: "0 0 0 1px #0d3324, 0 8px 32px rgba(0,0,0,0.5)",
            },
          },
        }}
      />
      <AppRoutes />
    </>
  );
}