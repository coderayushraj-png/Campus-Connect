import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const now = new Date()
  
  // Tomorrow range
  const tomorrowStart = new Date(now)
  tomorrowStart.setDate(
    tomorrowStart.getDate() + 1
  )
  tomorrowStart.setHours(0, 0, 0, 0)
  
  const tomorrowEnd = new Date(tomorrowStart)
  tomorrowEnd.setHours(23, 59, 59, 999)

  // 7 days range
  const weekStart = new Date(now)
  weekStart.setDate(weekStart.getDate() + 7)
  weekStart.setHours(0, 0, 0, 0)
  
  const weekEnd = new Date(weekStart)
  weekEnd.setHours(23, 59, 59, 999)

  // Get 1-day deadlines
  const { data: oneDayDeadlines } = 
    await supabase
      .from('deadlines')
      .select('*')
      .gte('date', tomorrowStart.toISOString())
      .lte('date', tomorrowEnd.toISOString())
      .eq('notified_1day', false)
      .eq('is_active', true)

  // Get 7-day deadlines
  const { data: weekDeadlines } = 
    await supabase
      .from('deadlines')
      .select('*')
      .gte('date', weekStart.toISOString())
      .lte('date', weekEnd.toISOString())
      .eq('notified_1week', false)
      .eq('is_active', true)

  // Get all active students
  const { data: students } = await supabase
    .from('profiles')
    .select('id, name, email, branch')
    .eq('role', 'student')
    .eq('is_active', true)

  let emailsSent = 0

  // Process 1-day deadlines
  for (const deadline of (oneDayDeadlines || [])) {
    const eligible = students?.filter(s => {
      if (!deadline.target_branches?.length) 
        return true
      return deadline.target_branches
        .includes(s.branch)
    }) || []

    for (const student of eligible) {
      // Send email via edge function
      await fetch(
        Deno.env.get('SUPABASE_URL') + 
        '/functions/v1/send-deadline-email',
        {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + 
              Deno.env.get('SUPABASE_ANON_KEY'),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            studentEmail: student.email,
            studentName: student.name,
            deadlineTitle: deadline.title,
            deadlineDate: deadline.date,
            deadlineType: deadline.type,
            daysLeft: 1
          })
        }
      )

      // Create in-app notification
      await supabase
        .from('notifications')
        .insert({
          user_id: student.id,
          title: '⚠️ Deadline Tomorrow!',
          message: deadline.title + 
            ' is due tomorrow!',
          type: deadline.type || 'deadline',
          related_id: deadline.related_id
        })

      emailsSent++
    }

    // Mark as notified
    await supabase
      .from('deadlines')
      .update({ notified_1day: true })
      .eq('id', deadline.id)
  }

  // Process 7-day deadlines
  for (const deadline of (weekDeadlines || [])) {
    const eligible = students?.filter(s => {
      if (!deadline.target_branches?.length) 
        return true
      return deadline.target_branches
        .includes(s.branch)
    }) || []

    for (const student of eligible) {
      await fetch(
        Deno.env.get('SUPABASE_URL') + 
        '/functions/v1/send-deadline-email',
        {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + 
              Deno.env.get('SUPABASE_ANON_KEY'),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            studentEmail: student.email,
            studentName: student.name,
            deadlineTitle: deadline.title,
            deadlineDate: deadline.date,
            deadlineType: deadline.type,
            daysLeft: 7
          })
        }
      )

      await supabase
        .from('notifications')
        .insert({
          user_id: student.id,
          title: '📅 Upcoming Deadline',
          message: deadline.title + 
            ' is due in 7 days.',
          type: deadline.type || 'deadline',
          related_id: deadline.related_id
        })

      emailsSent++
    }

    await supabase
      .from('deadlines')
      .update({ notified_1week: true })
      .eq('id', deadline.id)
  }

  return new Response(
    JSON.stringify({
      success: true,
      emailsSent,
      oneDayDeadlines: 
        oneDayDeadlines?.length || 0,
      weekDeadlines: 
        weekDeadlines?.length || 0
    }),
    { headers: { 
      'Content-Type': 'application/json' 
    }}
  )
})
