function safeJsonLdStringify(payload) {
  return JSON.stringify(payload).replace(/</g, "\\u003c");
}

export default function JsonLd({ data }) {
  if (!data) return null;

  const payloads = Array.isArray(data) ? data : [data];

  return (
    <>
      {payloads.map((payload, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJsonLdStringify(payload),
          }}
        />
      ))}
    </>
  );
}
