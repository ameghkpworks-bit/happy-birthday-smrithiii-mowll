import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    base: "/happy-birthday-smrithiii-mowll/",
  },

  tanstackStart: {
    server: { entry: "server" },

    spa: {
      enabled: true,
    },
  },
});
