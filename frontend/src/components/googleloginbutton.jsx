import { useEffect, useRef } from "react";

const GoogleLoginButton = ({
  onSuccess,
  onError,
  className = "",
  text = "continue_with",
}) => {
  const buttonRef = useRef(null);

  useEffect(() => {
    const initializeGoogle = () => {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

      if (!window.google || !buttonRef.current) {
        return;
      }

      if (!clientId) {
        onError?.(new Error("Google client ID is missing."));
        return;
      }

      buttonRef.current.innerHTML = "";

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          if (response?.credential) {
            onSuccess?.(response.credential);
          } else {
            onError?.(new Error("Google login failed"));
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "outline",
        size: "large",
        width: buttonRef.current.clientWidth || 360,
        text,
        shape: "rectangular",
        logo_alignment: "left",
      });
    };

    const loadGoogleScript = () => {
      if (window.google) {
        initializeGoogle();
        return;
      }

      const existingScript = document.getElementById("google-gsi-script");

      if (existingScript) {
        existingScript.addEventListener("load", initializeGoogle, { once: true });
        return;
      }

      const script = document.createElement("script");
      script.id = "google-gsi-script";
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogle;
      document.head.appendChild(script);
    };

    loadGoogleScript();
  }, [onSuccess, onError, text]);

  return (
    <div
      ref={buttonRef}
      className={`flex min-h-[44px] w-full justify-center ${className}`}
    />
  );
};

export default GoogleLoginButton;