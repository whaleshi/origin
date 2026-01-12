import Echo from "laravel-echo";
import Pusher from "pusher-js";

declare global {
    interface Window {
        Pusher: typeof Pusher;
    }
}

if (typeof window !== "undefined") {
    // Pusher 需要挂到 window
    window.Pusher = Pusher;
}

const echo =
    typeof window !== "undefined"
        ? new Echo({
              broadcaster: "pusher",
              key: process.env.NEXT_PUBLIC_REFERRAL_CODE,
              cluster: "",
              wsHost: process.env.NEXT_PUBLIC_WS,
              wsPort: 80,
              wssPort: 443,
              forceTLS: true,
              enabledTransports: ["ws", "wss"],
          })
        : null;

export default echo;
