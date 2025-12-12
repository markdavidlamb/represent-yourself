import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Counsel - Legal Document Assistant",
  description: "AI-powered legal document assistant with Google integration",
};

// Global error handler script - catches errors before React mounts
const errorHandlerScript = `
window.onerror = function(message, source, lineno, colno, error) {
  document.body.innerHTML = '<div style="background:#7f1d1d;color:white;padding:32px;min-height:100vh;font-family:system-ui"><h1 style="font-size:24px;margin-bottom:16px">JavaScript Error</h1><div style="background:#991b1b;padding:16px;border-radius:8px;margin-bottom:16px"><strong>Message:</strong><pre style="white-space:pre-wrap;word-break:break-all;margin-top:8px">' + message + '</pre></div><div style="background:#991b1b;padding:16px;border-radius:8px;margin-bottom:16px"><strong>Source:</strong> ' + source + '<br><strong>Line:</strong> ' + lineno + ', <strong>Column:</strong> ' + colno + '</div>' + (error && error.stack ? '<div style="background:#991b1b;padding:16px;border-radius:8px;margin-bottom:16px"><strong>Stack:</strong><pre style="font-size:12px;white-space:pre-wrap;word-break:break-all;margin-top:8px">' + error.stack + '</pre></div>' : '') + '<button onclick="location.reload()" style="background:white;color:#7f1d1d;border:none;padding:12px 24px;border-radius:8px;cursor:pointer;font-weight:bold">Reload App</button></div>';
  return true;
};
window.onunhandledrejection = function(event) {
  document.body.innerHTML = '<div style="background:#7f1d1d;color:white;padding:32px;min-height:100vh;font-family:system-ui"><h1 style="font-size:24px;margin-bottom:16px">Unhandled Promise Rejection</h1><div style="background:#991b1b;padding:16px;border-radius:8px;margin-bottom:16px"><strong>Reason:</strong><pre style="white-space:pre-wrap;word-break:break-all;margin-top:8px">' + (event.reason ? (event.reason.message || event.reason) : 'Unknown') + '</pre></div>' + (event.reason && event.reason.stack ? '<div style="background:#991b1b;padding:16px;border-radius:8px;margin-bottom:16px"><strong>Stack:</strong><pre style="font-size:12px;white-space:pre-wrap;word-break:break-all;margin-top:8px">' + event.reason.stack + '</pre></div>' : '') + '<button onclick="location.reload()" style="background:white;color:#7f1d1d;border:none;padding:12px 24px;border-radius:8px;cursor:pointer;font-weight:bold">Reload App</button></div>';
};
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <script dangerouslySetInnerHTML={{ __html: errorHandlerScript }} />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
