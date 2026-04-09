import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface OTPEmailProps {
  otpCode: string;
}

export const OTPEmail = ({ otpCode }: OTPEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your ForexWith.Salma verification code</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Verification Code</Heading>
          <Text style={text}>
            Please use the following OTP to verify your email address.
          </Text>
          <Section style={codeContainer}>
            <Text style={code}>{otpCode}</Text>
          </Section>
          <Text style={text}>
            If you didn't request this, you can safely ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default OTPEmail;

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  width: "560px",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  paddingTop: "32px",
  paddingBottom: "16px",
  textAlign: "center" as const,
};

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
  textAlign: "center" as const,
};

const codeContainer = {
  background: "rgba(0,0,0,.05)",
  borderRadius: "4px",
  margin: "16px auto",
  padding: "16px",
  width: "fit-content",
};

const code = {
  color: "#000",
  fontSize: "32px",
  fontWeight: "bold",
  letterSpacing: "4px",
  margin: "0",
};
