import "server-only";

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db";
import { env } from "./env";
import { emailOTP } from "better-auth/plugins";
import { transporter } from "./email";
import { render } from "@react-email/components";
import { OTPEmail } from "@/components/emails/otp-template";
import { LoginNotificationEmail } from "@/components/emails/login-notification";
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
  databaseHooks: {
    session: {
      create: {
        after: async (session) => {
          console.log(`[Auth Hook] Session created for user ${session.userId}`);

          // Get user details
          const user = await prisma.user.findUnique({
            where: { id: session.userId },
          });

          if (!user) {
            console.error(
              `[Auth Hook] User not found for session ${session.userId}`,
            );
            return;
          }

          console.log(
            `[Auth Hook] Sending login notification to ${user.email}...`,
          );

          try {
            const html = await render(
              React.createElement(LoginNotificationEmail, {
                userEmail: user.email || "",
                loginTime: new Date().toLocaleString("en-US", {
                  dateStyle: "full",
                  timeStyle: "short",
                }),
                location: session.ipAddress || "Unknown IP",
                userAgent: session.userAgent || "Unknown Device",
              }),
            );

            const info = await transporter.sendMail({
              from: env.SMTP_FROM,
              to: user.email || "",
              subject: "New Login Detected - ForexWith.Salma",
              html,
            });
            console.log(
              `[Auth Hook] Login notification sent to ${user.email}: ${info.messageId}`,
            );
          } catch (err) {
            console.error(
              "[Auth Hook] Failed to send login notification:",
              err,
            );
          }
        },
      },
    },
  },
});
