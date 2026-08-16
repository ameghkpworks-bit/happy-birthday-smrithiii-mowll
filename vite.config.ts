import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { nitro } from "nitro/vite";

export default defineConfig({
  vite: {
    base: "/happy-birthday-smrithiii-mowll/",

    plugins: [
      nitro({
        preset: "node-server",
      }),
    ],
  },

  tanstackStart: {
    spa: {
      enabled: true,

      prerender: {
        outputPath: "/index.html",
        crawlLinks: false,
        retryCount: 0,
      },
    },

    server: {
      entry: "server",
    },
  },
});

