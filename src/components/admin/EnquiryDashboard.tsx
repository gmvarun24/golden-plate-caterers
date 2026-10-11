import type { ServerProps } from 'payload'

import { ENQUIRY_STATUSES } from '@/lib/catalog/constants'
import { formatINR } from '@/lib/format/currency'

const istDay = (offsetDays = 0) => {
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date())
  const d = new Date(`${today}T00:00:00+05:30`)
  d.setUTCDate(d.getUTCDate() + offsetDays)
  return d.toISOString()
}

/** Admin home: enquiries by status, today's new ones and events in the next 7 days. */
export async function EnquiryDashboard({ payload, user }: ServerProps) {
  if (!user) return null
  const startToday = istDay(0)
  const in7 = istDay(7)

  const [byStatus, today, upcoming] = await Promise.all([
    Promise.all(
      ENQUIRY_STATUSES.map(async (s) => ({
        ...s,
        count: (await payload.count({ collection: 'enquiries', where: { status: { equals: s.value } }, overrideAccess: true })).totalDocs,
      })),
    ),
    payload.find({
      collection: 'enquiries',
      where: { createdAt: { greater_than_equal: startToday } },
      sort: '-createdAt',
      limit: 10,
      depth: 0,
      overrideAccess: true,
      select: { referenceId: true, customerName: true, guestCount: true, estimatedTotal: true, createdAt: true },
    }),
    payload.find({
      collection: 'enquiries',
      where: {
        and: [
          { eventDate: { greater_than_equal: startToday } },
          { eventDate: { less_than: in7 } },
          { status: { not_in: ['lost'] } },
        ],
      },
      sort: 'eventDate',
      limit: 20,
      depth: 1,
      overrideAccess: true,
      select: { referenceId: true, customerName: true, eventDate: true, guestCount: true, status: true, area: true },
    }),
  ])

  const card: React.CSSProperties = {
    border: '1px solid var(--theme-elevation-150)',
    borderRadius: 8,
    padding: '16px 20px',
    background: 'var(--theme-elevation-0)',
  }
  const day = (iso?: string | null) =>
    iso ? new Intl.DateTimeFormat('en-IN', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' }).format(new Date(iso)) : '—'
  const link = (id: number | string) => `/admin/collections/enquiries/${id}`

  return (
    <section style={{ marginBottom: 32 }} aria-label="Enquiry overview">
      <h2 style={{ marginBottom: 16 }}>Enquiries</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 20 }}>
        {byStatus.map((s) => (
          <a
            key={s.value}
            href={`/admin/collections/enquiries?where[status][equals]=${s.value}`}
            style={{ ...card, textDecoration: 'none', color: 'inherit' }}
          >
            <div style={{ fontSize: 28, fontWeight: 600 }}>{s.count}</div>
            <div style={{ opacity: 0.7 }}>{s.label}</div>
          </a>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
        <div style={card}>
          <h3 style={{ marginTop: 0 }}>New today ({today.totalDocs})</h3>
          {today.docs.length === 0 ? (
            <p style={{ opacity: 0.7 }}>No new enquiries yet today.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {today.docs.map((e) => (
                <li key={e.id} style={{ padding: '6px 0', borderBottom: '1px solid var(--theme-elevation-100)' }}>
                  <a href={link(e.id)}>{e.referenceId}</a> · {e.customerName} · {e.guestCount ?? '—'} guests
                  {e.estimatedTotal ? ` · ${formatINR(e.estimatedTotal)}` : ''}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div style={card}>
          <h3 style={{ marginTop: 0 }}>Events in the next 7 days ({upcoming.totalDocs})</h3>
          {upcoming.docs.length === 0 ? (
            <p style={{ opacity: 0.7 }}>Nothing scheduled this week.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {upcoming.docs.map((e) => (
                <li key={e.id} style={{ padding: '6px 0', borderBottom: '1px solid var(--theme-elevation-100)' }}>
                  <strong>{day(e.eventDate)}</strong> · <a href={link(e.id)}>{e.referenceId}</a> · {e.customerName} · {e.guestCount ?? '—'} guests ·{' '}
                  {e.area} · <em>{e.status}</em>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}
