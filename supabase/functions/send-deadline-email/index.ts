import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 
      'authorization, content-type',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: corsHeaders 
    })
  }

  try {
    const { 
      studentEmail,
      studentName,
      deadlineTitle,
      deadlineDate,
      deadlineType,
      daysLeft
    } = await req.json()

    const urgencyColor = 
      daysLeft <= 1 ? '#ef4444' : '#f59e0b'
    
    const typeEmoji = {
      placement: '🎓',
      event: '📅',
      exam: '📝',
      notice: '📢',
      general: '🔔'
    }[deadlineType] || '🔔'

    const formattedDate = new Date(deadlineDate)
      .toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" 
    content="width=device-width">
</head>
<body style="margin:0;padding:0;
  background:#f4f4f5;
  font-family:-apple-system,
  BlinkMacSystemFont,sans-serif;">
  
  <div style="max-width:560px;
    margin:40px auto;padding:0 16px;">
    
    <div style="background:linear-gradient(
      135deg,#6366f1,#8b5cf6);
      border-radius:16px 16px 0 0;
      padding:28px 32px;
      text-align:center;">
      <div style="font-size:36px;
        margin-bottom:8px;">
        ${typeEmoji}
      </div>
      <h1 style="color:white;margin:0;
        font-size:20px;font-weight:700;">
        Campus Connect
      </h1>
      <p style="color:rgba(255,255,255,0.7);
        margin:4px 0 0;font-size:13px;">
        Deadline Reminder
      </p>
    </div>

    <div style="background:white;
      padding:28px 32px;">
      
      <p style="color:#09090b;
        font-size:16px;margin:0 0 4px;">
        Hi ${studentName} 👋
      </p>
      <p style="color:#71717a;
        font-size:14px;margin:0 0 24px;">
        You have an upcoming deadline 
        that needs your attention.
      </p>

      <div style="background:#fafafa;
        border:1px solid #e4e4e7;
        border-left:4px solid ${urgencyColor};
        border-radius:12px;
        padding:16px 20px;
        margin-bottom:24px;">
        
        <p style="color:#71717a;
          font-size:11px;font-weight:600;
          text-transform:uppercase;
          letter-spacing:0.05em;
          margin:0 0 6px;">
          ${deadlineType?.toUpperCase()} DEADLINE
        </p>
        
        <p style="color:#09090b;
          font-size:17px;font-weight:700;
          margin:0 0 12px;line-height:1.4;">
          ${deadlineTitle}
        </p>
        
        <span style="background:${urgencyColor}20;
          color:${urgencyColor};
          font-size:12px;font-weight:600;
          padding:4px 10px;
          border-radius:20px;
          display:inline-block;">
          ${daysLeft === 0 
            ? '🔥 Due Today!' 
            : daysLeft === 1 
            ? '⚠️ Due Tomorrow!'
            : '📅 ' + daysLeft + ' Days Left'}
        </span>
        
        <p style="color:#71717a;
          font-size:13px;
          margin:10px 0 0;">
          📅 ${formattedDate}
        </p>
      </div>

      <div style="text-align:center;
        margin-bottom:24px;">
        <a href="${Deno.env.get('SITE_URL') || 'https://campusconnect.vercel.app'}/dashboard"
          style="background:linear-gradient(
            135deg,#6366f1,#8b5cf6);
            color:white;
            text-decoration:none;
            font-size:14px;font-weight:600;
            padding:12px 28px;
            border-radius:10px;
            display:inline-block;">
          View on Campus Connect →
        </a>
      </div>

      <p style="color:#a1a1aa;
        font-size:12px;text-align:center;
        margin:0;">
        Stay on top of your deadlines! 💪
      </p>
    </div>

    <div style="background:#f4f4f5;
      border-radius:0 0 16px 16px;
      padding:16px 32px;text-align:center;">
      <p style="color:#a1a1aa;
        font-size:11px;margin:0;">
        Campus Connect • MMDU, Ambala
        <br>You are receiving this because 
        you are a registered student.
      </p>
    </div>

  </div>
</body>
</html>
    `

    const res = await fetch(
      'https://api.resend.com/emails',
      {
        method: 'POST',
        headers: {
          'Authorization': 
            'Bearer ' + RESEND_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'Campus Connect <onboarding@resend.dev>',
          to: studentEmail,
          subject: daysLeft <= 1
            ? '⚠️ Deadline Tomorrow: ' 
              + deadlineTitle
            : '📅 Reminder: ' 
              + deadlineTitle 
              + ' - ' + daysLeft + ' Days Left',
          html: emailHtml
        })
      }
    )

    const data = await res.json()

    return new Response(
      JSON.stringify({ success: true, data }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})
