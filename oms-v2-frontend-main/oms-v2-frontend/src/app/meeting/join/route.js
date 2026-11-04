import { NextResponse } from "next/server";

/**
 * Public frontend route handler: /meeting/join
 *
 * Supports both token-based and parameter-based meeting joins.
 * Directly updates attendance in MySQL database and redirects to Google Meet or Dashboard.
 */

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  let meetingId = searchParams.get("meetingId");
  let attendeeId = searchParams.get("attendeeId");
  let email = (searchParams.get("email") || "").trim().toLowerCase();
  const token = searchParams.get("token") || "";
  const type = searchParams.get("type") || "meet";

  console.log(
    `[meeting/join] Hit frontend route: meetingId=${meetingId}, attendeeId=${attendeeId}, email=${email}, token=${token ? "present" : "missing"}, type=${type}`,
  );

  // Decode token if provided to extract meetingId, attendeeId, email
  if (token) {
    try {
      const decoded = Buffer.from(token.trim(), "base64url").toString("utf8");
      const lastColon = decoded.lastIndexOf(":");
      const payload = lastColon !== -1 ? decoded.substring(0, lastColon) : decoded;
      const parts = payload.split(":");
      if (parts.length >= 3) {
        if (!meetingId) meetingId = parts[0];
        if (!attendeeId) attendeeId = parts[1];
      }
      if (parts.length >= 4 && !email) {
        email = decodeURIComponent(parts.slice(2, parts.length - 1).join(":")).trim().toLowerCase();
      }
    } catch (e) {
      console.warn(`[meeting/join] Error decoding token in route.js: ${e.message}`);
    }
  }

  if (!meetingId) {
    return NextResponse.redirect(new URL("/hr-dashboard/meeting", request.url));
  }

  try {
    const mysql = await import("mysql2/promise");
    const pool = mysql.createPool({
      host: process.env.MYSQL_HOST || "143.110.183.212",
      port: Number(process.env.MYSQL_PORT || 3306),
      user: process.env.MYSQL_USERNAME || "revinr_oms_remote",
      password:
        process.env.MYSQL_PASSWORD || "c25a55cadcac686d9908ee47e07b1ddb",
      database: process.env.MYSQL_DATABASE || "revinr_oms_new",
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
    });

    // 1. Fetch meeting record
    const [meetingRows] = await pool.query(
      "SELECT id, title, start_at, end_at, meet_url FROM hr_meetings WHERE id = ?",
      [Number(meetingId)],
    );

    const meeting = meetingRows?.[0];
    if (!meeting) {
      await pool.end();
      return NextResponse.redirect(
        new URL("/hr-dashboard/meeting", request.url),
      );
    }

    // 2. Compute attendance status
    const startMs = new Date(meeting.start_at).getTime();
    const graceMs = 5 * 60 * 1000;
    const nowMs = Date.now();
    const attendanceStatus = nowMs <= startMs + graceMs ? "present" : "late";

    console.log(
      `[meeting/join] Meeting ${meetingId}, attendee ${attendeeId}, email ${email}, status: ${attendanceStatus}`,
    );

    // 3. Mark attendee
    if (attendeeId && Number.isFinite(Number(attendeeId))) {
      const [result] = await pool.query(
        "UPDATE hr_meeting_attendees SET attendance = ?, invite_status = 'accepted' WHERE meeting_id = ? AND id = ?",
        [attendanceStatus, Number(meetingId), Number(attendeeId)],
      );
      console.log(
        `[meeting/join] Updated by attendeeId ${attendeeId}: affectedRows=${result?.affectedRows}`,
      );

      if (result?.affectedRows === 0 && email) {
        const [r2] = await pool.query(
          "UPDATE hr_meeting_attendees SET attendance = ?, invite_status = 'accepted' WHERE meeting_id = ? AND LOWER(TRIM(email)) = ?",
          [attendanceStatus, Number(meetingId), email],
        );
        console.log(
          `[meeting/join] Updated by email ${email}: affectedRows=${r2?.affectedRows}`,
        );
      }
    } else if (email) {
      const [result] = await pool.query(
        "UPDATE hr_meeting_attendees SET attendance = ?, invite_status = 'accepted' WHERE meeting_id = ? AND LOWER(TRIM(email)) = ?",
        [attendanceStatus, Number(meetingId), email],
      );
      console.log(
        `[meeting/join] Updated by email ${email}: affectedRows=${result?.affectedRows}`,
      );
    }

    await pool.end();

    // 4. Redirect
    if (type === "meet" && meeting.meet_url) {
      return NextResponse.redirect(meeting.meet_url);
    }

    const queryParts = [];
    if (attendeeId) queryParts.push(`attendeeId=${attendeeId}`);
    if (email) queryParts.push(`attendeeEmail=${encodeURIComponent(email)}`);
    const qs = queryParts.length ? `?${queryParts.join("&")}` : "";

    return NextResponse.redirect(
      new URL(`/hr-dashboard/meeting/${meetingId}${qs}`, request.url),
    );
  } catch (dbError) {
    console.error(
      `[meeting/join] DB update failed: ${dbError.message}`,
    );
  }

  // ── Ultimate fallback ──
  return NextResponse.redirect(
    new URL(
      `/hr-dashboard/meeting/${meetingId || ""}`,
      request.url,
    ),
  );
}
