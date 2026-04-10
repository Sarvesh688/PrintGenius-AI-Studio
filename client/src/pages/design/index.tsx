import { Spinner } from "@/components/ui/spinner"
import { CanvasProvider } from "@/context/canvas-context"
import { getProductTemplateById } from "@/lib/api"
import { useQuery } from "@tanstack/react-query"
import { useParams } from "react-router-dom"
import CanvasEditor from "./component/canvas-editor"
import EditorSidebar from "./component/editor-sidebar"

const DesignPage = () => {
  const { product_id } = useParams()
  const { data, isLoading } = useQuery({
    queryKey: ["design", product_id],
    queryFn: async () => {
      const response = await getProductTemplateById(product_id!);
      return response
    }
  })
  const template = data?.template ?? null;
  const colors = data?.colors;
  const basePrice = data?.template?.basePrice ?? 0


  if (isLoading) {
    return <div className="flex flex-col h-[75vh] w-full items-center justify-center">
      <Spinner className="size-12" />
      <p className="text-sm text-muted-foreground">Loading Design Editor...</p>
    </div>
  }

  if (!template) {
    return <div className="flex flex-col h-screen w-full items-center justify-center">
      <p className="text-sm text-muted-foreground">Template not found</p>
    </div>
  }

  return (
    <CanvasProvider
      basePrice={basePrice}
    >
      <div className="flex w-full h-full">
        <aside className="hidden lg:block w-[400px] shrink-0 border-t border-r overflow-y-auto">
          <EditorSidebar
            templateId={template._id}
            basePrice={basePrice}
            colors={colors ?? []}
          />
        </aside>
        <div className="flex-1">
          <CanvasEditor
            template={template}
            defaultColor={colors?.[0]}
          />
        </div>
      </div>
    </CanvasProvider>
  )
}

export default DesignPage
