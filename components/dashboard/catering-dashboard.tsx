"use client"

import { UtensilsCrossed, Users, Pencil, Eye } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AnalyticsTab } from "./analytics-tab"
import { EditMenuTab } from "./edit-menu-tab"
import { PreviewExportTab } from "./preview-export-tab"
import { MenuBuilderTab } from "../menu-builder/menu-builder-tab"

export function CateringDashboard() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="builder" className="space-y-6">
        <TabsList className="w-full sm:w-auto grid grid-cols-4 sm:inline-flex">
          <TabsTrigger value="builder" className="gap-2">
            <UtensilsCrossed className="size-4" />
            <span className="hidden sm:inline">Builder</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <Users className="size-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="edit" className="gap-2">
            <Pencil className="size-4" />
            <span className="hidden sm:inline">Edit Menu</span>
          </TabsTrigger>
          <TabsTrigger value="preview" className="gap-2">
            <Eye className="size-4" />
            <span className="hidden sm:inline">Preview</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="builder">
          <MenuBuilderTab />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsTab />
        </TabsContent>

        <TabsContent value="edit">
          <EditMenuTab />
        </TabsContent>

        <TabsContent value="preview">
          <PreviewExportTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}