"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Error caught by error.tsx:", error);
  }, [error]);

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#7f1d1d",
      color: "white",
      padding: "32px",
      fontFamily: "system-ui, sans-serif"
    }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "24px" }}>
          Application Error
        </h1>

        <div style={{
          backgroundColor: "#991b1b",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "16px"
        }}>
          <strong style={{ display: "block", marginBottom: "8px" }}>Error Message:</strong>
          <pre style={{
            whiteSpace: "pre-wrap",
            wordBreak: "break-all",
            fontSize: "14px",
            margin: 0
          }}>
            {error.message || "Unknown error"}
          </pre>
        </div>

        {error.stack && (
          <div style={{
            backgroundColor: "#991b1b",
            padding: "20px",
            borderRadius: "8px",
            marginBottom: "16px"
          }}>
            <strong style={{ display: "block", marginBottom: "8px" }}>Stack Trace:</strong>
            <pre style={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-all",
              fontSize: "12px",
              margin: 0
            }}>
              {error.stack}
            </pre>
          </div>
        )}

        {error.digest && (
          <div style={{
            backgroundColor: "#991b1b",
            padding: "20px",
            borderRadius: "8px",
            marginBottom: "16px"
          }}>
            <strong>Error Digest:</strong> {error.digest}
          </div>
        )}

        <div style={{ marginTop: "24px" }}>
          <button
            onClick={reset}
            style={{
              backgroundColor: "white",
              color: "#7f1d1d",
              border: "none",
              padding: "12px 24px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
              marginRight: "12px"
            }}
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: "#fecaca",
              color: "#7f1d1d",
              border: "none",
              padding: "12px 24px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            Reload App
          </button>
        </div>
      </div>
    </div>
  );
}
