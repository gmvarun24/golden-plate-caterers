/** "Export CSV" link above the enquiries list (respects ?status= if you add it to the URL). */
export function ExportCsvButton() {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
      <a href="/api/enquiries/export.csv" className="btn btn--style-secondary btn--size-small" download>
        Export CSV
      </a>
    </div>
  )
}
