import PusherServer from "pusher";
import PusherClient from "pusher-js";

// Server instance
export const pusherServer = new PusherServer({
  appId: process.env.PUSHER_APP_ID || "dummy-app-id",
  key: process.env.NEXT_PUBLIC_PUSHER_KEY || "dummy-key",
  secret: process.env.PUSHER_SECRET || "dummy-secret",
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "us2",
  useTLS: true,
});

// Client instance
export const pusherClient = new PusherClient(
  process.env.NEXT_PUBLIC_PUSHER_KEY || "dummy-key",
  {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "us2",
  }
);
