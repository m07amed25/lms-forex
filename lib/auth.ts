import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db";
import { env } from "./env";
import { emailOTP } from "better-auth/plugins";
import { hasSmtpConfig, transporter } from "./email";
import { render } from "@react-email/components";
import { OTPEmail } from "@/components/emails/otp-template";
import { LoginNotificationEmail } from "@/components/emails/login-notification";
import React from "react";
import { admin } from "better-auth/plugins";

const githubProvider =
  env.GITHUB_ID && env.GITHUB_SECRET
    ? {
        clientId: env.GITHUB_ID,
        clientSecret: env.GITHUB_SECRET,
      }
    : null;

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  logger: {
    level: "debug",
  },
  ...(githubProvider
    ? {
        socialProviders: {
          github: githubProvider,
        },
      }
    : {}),
  plugins: [
    ...(hasSmtpConfig
      ? [
          emailOTP({
            async sendVerificationOTP({ email, otp }) {
              if (!transporter) {
                throw new Error("SMTP provider is not configured");
              }

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
        ]
      : []),
    admin(),
  ],
  databaseHooks: {
    session: {
      create: {
        after: async (session) => {
          if (!transporter) {
            return;
          }

          console.log(`[Auth Hook] Session created for user ${session.userId}`);

          // Get user details
          const user = await prisma.user.findUnique({
            where: { id: session.userId },
          });

          if (!user || !user.email) {
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
              to: user.email,
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
