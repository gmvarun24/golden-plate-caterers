import { describe, expect, it } from 'vitest'

import { csvCell, toCsv } from '@/lib/enquiry/csv'

describe('csv', () => {
  it('quotes commas, quotes and newlines', () => {
    expect(csvCell('a,b')).toBe('"a,b"')
    expect(csvCell('say "hi"')).toBe('"say ""hi"""')
    expect(csvCell('line1\nline2')).toBe('"line1\nline2"')
    expect(csvCell(null)).toBe('')
    expect(csvCell(42)).toBe('42')
  })

  it('neutralises spreadsheet formulas', () => {
    expect(csvCell('=HYPERLINK("x")')).toBe(`"'=HYPERLINK(""x"")"`)
    expect(csvCell('+919876543210')).toBe("'+919876543210")
    expect(csvCell('-2')).toBe("'-2")
  })

  it('builds a CRLF document', () => {
    expect(toCsv(['a', 'b'], [[1, 'x']])).toBe('a,b\r\n1,x\r\n')
  })
})
