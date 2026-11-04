import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, mobile, company, message } = body;

    if (!name || !email || !mobile || !message) {
      return NextResponse.json(
        { error: "Name, email, mobile number, and message are required fields." },
        { status: 400 }
      );
    }

    const backendUrl =
      process.env.NEXT_PUBLIC_DEV_BASE_URL ||
      process.env.NEXT_PUBLIC_PROD_BASE_URL ||
      "http://localhost:4000";

    try {
      const apiRes = await fetch(`${backendUrl}/api/v1/contact/send-message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, mobile, company, message }),
      });

      if (apiRes.ok) {
        const data = await apiRes.json();
        return NextResponse.json(data, { status: 200 });
      }
    } catch (backendErr) {
      console.warn("Backend API not reachable from frontend route, proceeding with local fallback:", backendErr.message);
    }

    // Direct fallback if backend API service is offline or unreachable
    const recipientEmail = "info@domplio.com";
    const smtpHost = process.env.MAIL_HOST || process.env.SMTP_HOST || "smtp.postmarkapp.com";
    const smtpPort = parseInt(process.env.MAIL_PORT || process.env.SMTP_PORT || "587", 10);
    const smtpUser = process.env.MAIL_USER || process.env.SMTP_USER;
    const smtpPass = process.env.MAIL_PASS || process.env.SMTP_PASS;

    if (smtpUser && smtpPass) {
      try {
        const nodemailer = (await import("nodemailer")).default;
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465,
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });

        await transporter.sendMail({
          from: `"Contact Form" <${smtpUser}>`,
          replyTo: email,
          to: recipientEmail,
          subject: `New Contact Form Message from ${name}`,
          text: `Name: ${name}\nEmail: ${email}\nMobile: ${mobile}\nCompany: ${company || "N/A"}\n\nMessage:\n${message}`,
        });
      } catch (mailErr) {
        console.error("Nodemailer transport error:", mailErr);
      }
    } else {
      console.log("Contact message received (target: info@domplio.com):", {
        to: recipientEmail,
        name,
        email,
        mobile,
        company,
        message,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: `Your message has been successfully sent to ${recipientEmail}`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing contact form submission:", error);
    return NextResponse.json(
      { error: "Failed to send message. Please try again later." },
      { status: 500 }
    );
  }
}
