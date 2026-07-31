"use client"

import { ClipboardList, Users, Pencil, Eye, ChefHat } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AnalyticsTab } from "./analytics-tab"
import { EditMenuTab } from "./edit-menu-tab"
import { PreviewExportTab } from "./preview-export-tab"
import { MenuBuilderTab } from "../menu-builder/menu-builder-tab"
import { CateringTab } from "./catering-tab"
import { ErrorBoundary } from "../error-boundary"

export function CateringDashboard() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="builder" className="space-y-6">
        <TabsList className="w-full sm:w-auto grid grid-cols-5 sm:inline-flex">
          <TabsTrigger value="builder" className="gap-2">
            <ClipboardList className="size-4" />
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
          <TabsTrigger value="catering" className="gap-2">
            <ChefHat className="size-4" />
            <span className="hidden sm:inline">Catering</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="builder">
          <ErrorBoundary>
            <MenuBuilderTab />
          </ErrorBoundary>
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

        <TabsContent value="catering">
          <ErrorBoundary>
            <CateringTab />
          </ErrorBoundary>
        </TabsContent>
      </Tabs>
    </div>
  )
}