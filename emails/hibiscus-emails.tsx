import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
  pixelBasedPreset,
} from "react-email";

export type EmailLineItem = {
  name: string;
  quantity: number;
  unitAmountCents: number;
};

export type BookingEmailDetails = {
  customerName: string;
  reference: string;
  serviceName: string;
  bookedTime: string;
  address: string;
  email: string;
  phone: string;
  notes?: string | null;
  items: EmailLineItem[];
  totalCents: number;
  adminUrl: string;
};

export type QuoteEmailDetails = {
  customerName: string;
  reference: string;
  serviceName: string;
  email: string;
  phone: string;
  address: string;
  preferredTime: string;
  notes?: string | null;
  adminUrl: string;
};

const bookingPreviewProps: BookingEmailDetails = {
  customerName: "Taylor",
  reference: "AB12CD34",
  serviceName: "SKIP 2 U",
  bookedTime: "Friday, 25 September 2026 at 10:00 am",
  address: "202 Pine Valley Road, Dairy Flat",
  email: "taylor@example.com",
  phone: "021 555 0100",
  items: [{ name: "2m³ Cubic Mini Skip", quantity: 1, unitAmountCents: 23500 }],
  totalCents: 23500,
  adminUrl: "https://example.com/admin",
};

const quotePreviewProps: QuoteEmailDetails = {
  customerName: "Taylor Morgan",
  reference: "EF56GH78",
  serviceName: "WASH 2 U",
  email: "taylor@example.com",
  phone: "021 555 0100",
  address: "202 Pine Valley Road, Dairy Flat",
  preferredTime: "30 September 2026 · Morning",
  notes: "Please quote for the driveway and front path.",
  adminUrl: "https://example.com/admin",
};

function money(cents: number) {
  return new Intl.NumberFormat("en-NZ", { style: "currency", currency: "NZD" }).format(cents / 100);
}

function EmailFrame({ preview, title, children }: { preview: string; title: string; children: React.ReactNode }) {
  return (
    <Html lang="en" dir="ltr">
      <Tailwind config={{ presets: [pixelBasedPreset] }}>
        <Head><title>{title}</title></Head>
        <Body className="m-0 bg-gray-100 font-sans">
          <Preview lang="en" dir="ltr">{preview}</Preview>
          <Container lang="en" dir="ltr" className="mx-auto my-8 max-w-xl overflow-hidden rounded-lg border border-solid border-gray-200 bg-white">
            <Section className="bg-gray-950 px-7 py-6">
              <Text className="m-0 text-xl font-bold tracking-wider text-white">HIBISCUS GROUP</Text>
            </Section>
            <Section className="px-7 py-7">
              {children}
              <Hr className="my-7 border-solid border-gray-200" />
              <Text className="m-0 text-sm leading-6 text-gray-600">
                Hibiscus Group · 022 183 1176 · info@hib.gdn
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

function LabelValue({ label, value }: { label: string; value: string }) {
  return (
    <Section className="mb-3">
      <Text className="m-0 text-xs font-bold uppercase tracking-wide text-gray-500">{label}</Text>
      <Text className="m-0 mt-1 whitespace-pre-line text-base leading-6 text-gray-900">{value}</Text>
    </Section>
  );
}

function ItemSummary({ items, totalCents }: { items: EmailLineItem[]; totalCents: number }) {
  return (
    <Section className="my-6 rounded-md border border-solid border-gray-200 bg-gray-50 p-5">
      <Heading as="h2" className="m-0 mb-4 text-lg font-bold text-gray-900">Booked items</Heading>
      {items.map((item) => (
        <Row key={item.name} className="mb-2">
          <Column><Text className="m-0 text-sm text-gray-800">{item.quantity} × {item.name}</Text></Column>
          <Column className="text-right"><Text className="m-0 text-sm font-bold text-gray-900">{money(item.quantity * item.unitAmountCents)}</Text></Column>
        </Row>
      ))}
      <Hr className="my-4 border-solid border-gray-300" />
      <Row>
        <Column><Text className="m-0 text-base font-bold text-gray-900">Total paid</Text></Column>
        <Column className="text-right"><Text className="m-0 text-base font-bold text-gray-900">{money(totalCents)}</Text></Column>
      </Row>
    </Section>
  );
}

export function BookingConfirmationEmail(input?: BookingEmailDetails) {
  const props = { ...bookingPreviewProps, ...input };
  return (
    <EmailFrame preview={`Booking ${props.reference} is confirmed for ${props.bookedTime}`} title={`Your Hibiscus Group booking ${props.reference} is confirmed`}>
      <Heading as="h1" className="m-0 text-3xl font-bold leading-9 text-gray-950">Your booking is confirmed</Heading>
      <Text className="my-5 text-base leading-7 text-gray-800">
        Hi {props.customerName}, your payment is complete and your booking time is confirmed.
      </Text>
      <Section className="rounded-md border border-solid border-pink-200 bg-pink-50 p-5">
        <LabelValue label="Booking reference" value={props.reference} />
        <LabelValue label="Service" value={props.serviceName} />
        <LabelValue label="Booked time" value={props.bookedTime} />
        <LabelValue label="Service address" value={props.address} />
      </Section>
      <ItemSummary items={props.items} totalCents={props.totalCents} />
      <Text className="m-0 text-base leading-7 text-gray-800">
        Need to update anything? Reply to this email or call 022 183 1176 and quote reference {props.reference}.
      </Text>
    </EmailFrame>
  );
}

export function CompanyBookingEmail(input?: BookingEmailDetails) {
  const props = { ...bookingPreviewProps, ...input };
  return (
    <EmailFrame preview={`Paid booking ${props.reference} from ${props.customerName}`} title={`New paid booking ${props.reference}`}>
      <Heading as="h1" className="m-0 text-3xl font-bold leading-9 text-gray-950">New paid booking</Heading>
      <Text className="my-5 text-base leading-7 text-gray-800">A customer has paid and the stock has been deducted.</Text>
      <Section className="rounded-md border border-solid border-gray-200 bg-gray-50 p-5">
        <LabelValue label="Reference" value={props.reference} />
        <LabelValue label="Customer" value={props.customerName} />
        <LabelValue label="Contact" value={`${props.email}\n${props.phone}`} />
        <LabelValue label="Service" value={props.serviceName} />
        <LabelValue label="Booked time" value={props.bookedTime} />
        <LabelValue label="Address" value={props.address} />
        {props.notes ? <LabelValue label="Notes" value={props.notes} /> : null}
      </Section>
      <ItemSummary items={props.items} totalCents={props.totalCents} />
      <Button href={props.adminUrl} className="box-border block rounded-md bg-pink-600 px-6 py-4 text-center text-base font-bold text-white no-underline">
        View paid bookings
      </Button>
    </EmailFrame>
  );
}

export function QuoteReceivedEmail(input?: QuoteEmailDetails) {
  const props = { ...quotePreviewProps, ...input };
  return (
    <EmailFrame preview={`We received your ${props.serviceName} quote request`} title={`Your Hibiscus Group quote request ${props.reference}`}>
      <Heading as="h1" className="m-0 text-3xl font-bold leading-9 text-gray-950">We received your quote request</Heading>
      <Text className="my-5 text-base leading-7 text-gray-800">
        Hi {props.customerName}, thanks for getting in touch. Our team will review your {props.serviceName} request and contact you with the next steps.
      </Text>
      <Section className="rounded-md border border-solid border-pink-200 bg-pink-50 p-5">
        <LabelValue label="Request reference" value={props.reference} />
        <LabelValue label="Service" value={props.serviceName} />
        <LabelValue label="Preferred time" value={props.preferredTime} />
        <LabelValue label="Address" value={props.address} />
        {props.notes ? <LabelValue label="Your notes" value={props.notes} /> : null}
      </Section>
      <Text className="mt-6 text-base leading-7 text-gray-800">
        If anything changes, reply to this email or call 022 183 1176 and quote reference {props.reference}.
      </Text>
    </EmailFrame>
  );
}

export function CompanyQuoteEmail(input?: QuoteEmailDetails) {
  const props = { ...quotePreviewProps, ...input };
  return (
    <EmailFrame preview={`Quote request ${props.reference} from ${props.customerName}`} title={`New quote request ${props.reference}`}>
      <Heading as="h1" className="m-0 text-3xl font-bold leading-9 text-gray-950">New quote request</Heading>
      <Text className="my-5 text-base leading-7 text-gray-800">A customer is waiting for the team to review their request.</Text>
      <Section className="rounded-md border border-solid border-gray-200 bg-gray-50 p-5">
        <LabelValue label="Reference" value={props.reference} />
        <LabelValue label="Customer" value={props.customerName} />
        <LabelValue label="Contact" value={`${props.email}\n${props.phone}`} />
        <LabelValue label="Service" value={props.serviceName} />
        <LabelValue label="Preferred time" value={props.preferredTime} />
        <LabelValue label="Address" value={props.address} />
        {props.notes ? <LabelValue label="Notes" value={props.notes} /> : null}
      </Section>
      <Button href={props.adminUrl} className="box-border mt-6 block rounded-md bg-pink-600 px-6 py-4 text-center text-base font-bold text-white no-underline">
        Open staff dashboard
      </Button>
    </EmailFrame>
  );
}

BookingConfirmationEmail.PreviewProps = bookingPreviewProps;
CompanyBookingEmail.PreviewProps = bookingPreviewProps;
QuoteReceivedEmail.PreviewProps = quotePreviewProps;
CompanyQuoteEmail.PreviewProps = quotePreviewProps;

export default BookingConfirmationEmail;
