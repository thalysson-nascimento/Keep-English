"use client";

import { createAuthClient } from "better-auth/react";

const avatarFieldsPlugin = {
  id: "avatar-fields",
  $InferServerPlugin: {
    schema: {
      user: {
        fields: {
          avatar: {
            type: "string",
            required: true,
            input: true,
          },
        },
      },
    },
  },
} as const;

export const authClient = createAuthClient({
  plugins: [avatarFieldsPlugin],
});
