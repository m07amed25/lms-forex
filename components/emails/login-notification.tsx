import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Hr,
  Row,
  Column,
} from "@react-email/components";
import * as React from "react";

interface LoginNotificationEmailProps {
  userEmail: string;
  loginTime: string;
  location?: string;
  userAgent?: string;
}

const baseUrl = process.env.BETTER_AUTH_URL
  ? process.env.BETTER_AUTH_URL
  : "http://localhost:3000";

export const LoginNotificationEmail = ({
  userEmail,
  loginTime,
  location = "Unknown",
  userAgent = "Unknown Browser",
}: LoginNotificationEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Security Alert: New login to your ForexWith.Salma account</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Img
              src={`${baseUrl}/logo.png`}
              width="180"
              height="auto"
              alt="ForexWith.Salma"
              style={logo}
            />
          </Section>

          <Heading style={h1}>New Login Detected</Heading>
          
          <Text style={text}>
            Hello,
          </Text>
          <Text style={text}>
            We noticed a new login to your account <strong>{userEmail}</strong>. If this was you, you can safely ignore this email.
          </Text>
          
          <Section style={detailsContainer}>
            <Text style={detailsTitle}>Login activity details</Text>
            <Hr style={innerHr} />
            
            <Row style={detailRow}>
              <Column style={detailLabelColumn}><Text style={detailLabel}>Time</Text></Column>
              <Column><Text style={detailValue}>{loginTime}</Text></Column>
            </Row>
            <Row style={detailRow}>
              <Column style={detailLabelColumn}><Text style={detailLabel}>Location</Text></Column>
              <Column><Text style={detailValue}>{location}</Text></Column>
            </Row>
            <Row style={detailRow}>
              <Column style={detailLabelColumn}><Text style={detailLabel}>Device</Text></Column>
              <Column><Text style={detailValue}>{userAgent}</Text></Column>
            </Row>
          </Section>

          <Section style={warningSection}>
            <Heading as="h2" style={h2}>Was this you?</Heading>
            <Text style={warningText}>
              If you did not log in to your account, please secure your account immediately. This will reset your active sessions and protect your data.
            </Text>
            <Link 
              href={`${baseUrl}/login`} 
              style={button}
            >
              Secure My Account
            </Link>
          </Section>

          <Hr style={hr} />
          
          <Section style={footer}>
            <Text style={footerText}>
              &copy; {new Date().getFullYear()} ForexWith.Salma. All rights reserved.
            </Text>
            <Text style={footerLink}>
              <Link href={`${baseUrl}/privacy`} style={link}>Privacy Policy</Link> • <Link href={`${baseUrl}/terms`} style={link}>Terms of Service</Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default LoginNotificationEmail;

// --- Styles ---

const main = {
  backgroundColor: "#f9fafb",
  padding: "40px 0",
  fontFamily:
    'Inter, -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "12px",
  margin: "0 auto",
  padding: "48px 40px",
  width: "600px",
  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
};

const header = {
  marginBottom: "32px",
  textAlign: "center" as const,
};

const logo = {
  margin: "0 auto",
};

const h1 = {
  color: "#111827",
  fontSize: "24px",
  fontWeight: "700",
  lineHeight: "32px",
  margin: "0 0 16px",
  textAlign: "center" as const,
};

const h2 = {
  color: "#111827",
  fontSize: "18px",
  fontWeight: "600",
  margin: "0 0 12px",
};

const text = {
  color: "#4b5563",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "0 0 16px",
};

const detailsContainer = {
  backgroundColor: "#f3f4f6",
  borderRadius: "8px",
  padding: "24px",
  margin: "32px 0",
};

const detailsTitle = {
  color: "#111827",
  fontSize: "13px",
  fontWeight: "600",
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
  margin: "0 0 12px",
};

const innerHr = {
  borderColor: "#e5e7eb",
  margin: "0 0 16px",
};

const detailRow = {
  marginBottom: "8px",
};

const detailLabelColumn = {
  width: "100px",
};

const detailLabel = {
  color: "#6b7280",
  fontSize: "14px",
  fontWeight: "500",
  margin: "0",
};

const detailValue = {
  color: "#111827",
  fontSize: "14px",
  fontWeight: "500",
  margin: "0",
};

const warningSection = {
  backgroundColor: "#fffafa",
  border: "1px solid #fee2e2",
  borderRadius: "8px",
  padding: "24px",
  textAlign: "center" as const,
  margin: "32px 0",
};

const warningText = {
  color: "#991b1b",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0 0 20px",
};

const button = {
  backgroundColor: "#111827",
  borderRadius: "6px",
  color: "#ffffff",
  fontSize: "15px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 32px",
};

const hr = {
  borderColor: "#e5e7eb",
  margin: "40px 0 24px",
};

const footer = {
  textAlign: "center" as const,
};

const footerText = {
  color: "#9ca3af",
  fontSize: "12px",
  lineHeight: "18px",
  margin: "0 0 8px",
};

const footerLink = {
  color: "#9ca3af",
  fontSize: "12px",
};

const link = {
  color: "#6b7280",
  textDecoration: "underline",
};

