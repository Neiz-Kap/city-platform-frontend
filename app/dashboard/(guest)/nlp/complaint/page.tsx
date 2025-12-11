import ComplaintDataTable from "@/components/widgets/ComplaintDataTable"
import ComplaintStatsBlock from "@/components/widgets/ComplaintStatsBlock"

export default function ComplaintPage() {
  return (
    <section>
      <h1 className="text-2xl font-bold mb-4">Жалобы</h1>

      <ComplaintStatsBlock />
      <ComplaintDataTable />
    </section>
  )
}
