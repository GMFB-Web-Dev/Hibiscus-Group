import "server-only";

import { Resend } from "resend";
import {
  BookingConfirmationEmail,
  CompanyBookingEmail,
  CompanyQuoteEmail,
  QuoteReceivedEmail,
  type BookingEmailDetails,
  type QuoteEmailDetails,
} from "@/emails/hibiscus-emails";

type EmailKind = "booking-customer" | "booking-company" | "quote-customer" | "quote-company";

function emailConfig() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const companyEmail = process.env.COMPANY_NOTIFICATION_EMAIL?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();

  if (!apiKey || !companyEmail || !from) {
    throw new Error("Email delivery is not configured.");
  }

  return { resend: new Resend(apiKey), companyEmail, from };
}

function retryable(statusCode: number | null) {
  return statusCode === 429 || (statusCode !== null && statusCode >= 500);
}

async function sendEmail(input: {
  kind: EmailKind;
  requestId: string;
  to: string;
  replyTo: string;
  subject: string;
  react: React.ReactElement;
}) {
  const { resend, from } = emailConfig();

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const { data, error } = await resend.emails.send({
      from,
      to: [input.to],
      replyTo: input.replyTo,
      subject: input.subject,
      react: input.react,
      tags: [
        { name: "email_type", value: input.kind },
        { name: "request_id", value: input.requestId },
      ],
    }, { idempotencyKey: `hibiscus-${input.kind}-${input.requestId}` });

    if (!error) return data.id;
    if (!retryable(error.statusCode) || attempt === 2) {
      throw new Error(`Resend rejected ${input.kind}: ${error.name}`);
    }

    await new Promise((resolve) => setTimeout(resolve, 500 * (2 ** attempt)));
  }

  throw new Error(`Unable to send ${input.kind}.`);
}

export async function sendBookingEmails(requestId: string, details: BookingEmailDetails) {
  const { companyEmail } = emailConfig();
  await Promise.all([
    sendEmail({
      kind: "booking-customer",
      requestId,
      to: details.email,
      replyTo: companyEmail,
      subject: `Booking ${details.reference} confirmed — ${details.bookedTime}`,
      react: <BookingConfirmationEmail {...details} />,
    }),
    sendEmail({
      kind: "booking-company",
      requestId,
      to: companyEmail,
      replyTo: details.email,
      subject: `New paid booking ${details.reference} — ${details.customerName}`,
      react: <CompanyBookingEmail {...details} />,
    }),
  ]);
}

export async function sendQuoteEmails(requestId: string, details: QuoteEmailDetails) {
  const { companyEmail } = emailConfig();
  await Promise.all([
    sendEmail({
      kind: "quote-customer",
      requestId,
      to: details.email,
      replyTo: companyEmail,
      subject: `We received your ${details.serviceName} quote request — ${details.reference}`,
      react: <QuoteReceivedEmail {...details} />,
    }),
    sendEmail({
      kind: "quote-company",
      requestId,
      to: companyEmail,
      replyTo: details.email,
      subject: `New quote request ${details.reference} — ${details.customerName}`,
      react: <CompanyQuoteEmail {...details} />,
    }),
  ]);
}
