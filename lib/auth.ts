import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db";
import { env } from "./env";
import { emailOTP } from "better-auth/plugins";
import { transporter } from "./email";
import { render } from "@react-email/components";
import { OTPEmail } from "@/components/emails/otp-template";
import React from "react";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  socialProviders: {
    github: {
      clientId: env.GITHUB_ID,
      clientSecret: env.GITHUB_SECRET,
    },
  },
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp }) {
        const html = await render(
          React.createElement(OTPEmail, { otpCode: otp }),
        );

        await transporter.sendMail({
          from: env.SMTP_FROM,
          to: email,
          subject: "Verification Code",
          html,
        });
      },
    }),
  ],
});
