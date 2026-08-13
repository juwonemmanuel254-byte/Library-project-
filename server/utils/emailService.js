import nodemailer from 'nodemailer'

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  })
}

/**
 * Send welcome email to newly created staff member
 */
export const sendStaffWelcomeEmail = async ({ name, email, password, role, inviteCode, createdBy }) => {
  // If email not configured, log to console and skip silently
  if (!process.env.GMAIL_USER || process.env.GMAIL_USER === 'your-gmail@gmail.com') {
    console.log('\n── Staff Account Created (email not configured) ──')
    console.log(`  To:          ${email}`)
    console.log(`  Name:        ${name}`)
    console.log(`  Role:        ${role}`)
    console.log(`  Password:    ${password}`)
    console.log(`  Invite Code: ${inviteCode}`)
    console.log('─────────────────────────────────────────────────\n')
    return { skipped: true }
  }

  const transporter = createTransporter()

  const roleLabel = role === 'admin' ? 'Administrator' : 'Librarian'
  const appUrl    = `http://localhost:5173`

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body        { font-family: Arial, sans-serif; background: #f4f3ec; margin: 0; padding: 0; }
    .wrapper    { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .header     { background: linear-gradient(135deg, #1a3c5e, #2d6a9f); padding: 36px 40px; text-align: center; }
    .header h1  { color: #fff; margin: 0; font-size: 24px; letter-spacing: 0.5px; }
    .header p   { color: rgba(255,255,255,0.75); margin: 8px 0 0; font-size: 14px; }
    .body       { padding: 36px 40px; }
    .body p     { color: #444; line-height: 1.7; font-size: 15px; margin: 0 0 16px; }
    .info-box   { background: #f0f4f8; border-left: 4px solid #1a3c5e; border-radius: 8px; padding: 20px 24px; margin: 24px 0; }
    .info-row   { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e0e0e0; font-size: 14px; }
    .info-row:last-child { border-bottom: none; }
    .info-label { color: #666; font-weight: 600; }
    .info-value { color: #1a3c5e; font-weight: 700; font-family: monospace; font-size: 15px; }
    .code-box   { background: #1a3c5e; color: #f0d080; font-family: monospace; font-size: 22px; font-weight: 700; text-align: center; padding: 18px; border-radius: 8px; letter-spacing: 3px; margin: 20px 0; }
    .btn        { display: block; width: fit-content; margin: 24px auto 0; background: #1a3c5e; color: #fff; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-size: 15px; font-weight: 600; }
    .footer     { background: #f4f3ec; padding: 20px 40px; text-align: center; color: #999; font-size: 12px; }
    .warning    { background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 14px 18px; font-size: 13px; color: #92400e; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>📖 LibraryMS</h1>
      <p>Library Management System</p>
    </div>

    <div class="body">
      <p>Hello <strong>${name}</strong>,</p>
      <p>
        A <strong>${roleLabel}</strong> account has been created for you on LibraryMS
        by <strong>${createdBy}</strong>. You can now log in and start managing the library.
      </p>

      <div class="info-box">
        <div class="info-row">
          <span class="info-label">Your Name</span>
          <span class="info-value">${name}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Email</span>
          <span class="info-value">${email}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Temporary Password</span>
          <span class="info-value">${password}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Role</span>
          <span class="info-value">${roleLabel}</span>
        </div>
      </div>

      <p>Your <strong>Staff Invite Code</strong> (needed if you ever re-register):</p>
      <div class="code-box">${inviteCode}</div>

      <a href="${appUrl}" class="btn">Log In to LibraryMS →</a>

      <div class="warning">
        ⚠️ Please change your password after your first login. Keep your invite code
        confidential and do not share it with library members.
      </div>
    </div>

    <div class="footer">
      <p>This email was sent automatically by LibraryMS. Do not reply to this email.</p>
      <p>© ${new Date().getFullYear()} LibraryMS. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `

  await transporter.sendMail({
    from:    `"LibraryMS" <${process.env.GMAIL_USER}>`,
    to:      email,
    subject: `Your LibraryMS ${roleLabel} Account`,
    html,
  })

  return { sent: true }
}
