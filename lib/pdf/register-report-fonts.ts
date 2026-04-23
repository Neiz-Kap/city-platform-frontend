let registered = false

/** Call before `pdf()`; loads @react-pdf/renderer only when generating a report. */
export async function registerReportFonts(origin: string): Promise<void> {
  if (registered) return
  const { Font } = await import("@react-pdf/renderer")
  const base = origin.replace(/\/$/, "")
  Font.register({
    family: "NotoSans",
    fonts: [
      {
        src: `${base}/fonts/NotoSans-Regular.ttf`,
        fontStyle: "normal",
        fontWeight: 400,
      },
    ],
  })
  registered = true
}
