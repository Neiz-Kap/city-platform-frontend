import { Font } from "@react-pdf/renderer"

let registered = false

/** Call before `pdf()` / rendering; `origin` without trailing slash, e.g. window.location.origin */
export function registerReportFonts(origin: string): void {
  if (registered) return
  const base = origin.replace(/\/$/, "")
  Font.register({
    family: "NotoSans",
    fonts: [{ src: `${base}/fonts/NotoSans-Regular.ttf` }],
  })
  registered = true
}
