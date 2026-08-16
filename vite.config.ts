import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { nitro } from "nitro/vite";

export default defineConfig({
  vite: {
    base: "/happy-birthday-smrithiii-mowll/",

    plugins: [
      nitro({
        preset: "github-pages",
      }),
    ],
  },

  tanstackStart: {
    spa: {
      enabled: true,
    },

    server: {
      entry: "server",
    },

    prerender: {
      enabled: true,
      autoSubfolderIndex: true,
      autoStaticPathsDiscovery: true,
      crawlLinks: true,
      failOnError: true,
    },

    pages: [
      {
        path: "/",
        prerender: {
          enabled: true,
          outputPath: "/index.html",
        },
      },
    ],
  },
});
