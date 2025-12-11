// app/dashboard/(guest)/nlp/complaint/[complaintId]/page.tsx
// import { ComplaintSkeleton } from "@/lib/components/skeletons/ComplaintSkeleton"
// import { ComplaintContent } from "./ComplaintContent"
// import { getComplaintServerSnapshot } from "./server-actions"

type Props = {
  params: {
    complaintId: string
  }
}

// Server Component
export default async function ComplaintDetailPage({ params }: Props) {
  const { complaintId } = params

  // Получаем данные на сервере для начального рендеринга
  // const initialData = await getComplaintServerSnapshot(complaintId)
  // const initialData = []

  // if (!initialData || !initialData.complaint) {
  //   notFound()
  // }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* <Suspense fallback={<ComplaintSkeleton />}>
        <ComplaintContent
          complaintId={complaintId}
          initialData={initialData}
        />
      </Suspense> */}
    </div>
  )
}
