"use client"

import { useState } from "react"
import { ClipboardList, Users, Pencil, Eye, ChefHat, UtensilsCrossed } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AnalyticsTab } from "./analytics-tab"
import { EditMenuTab } from "./edit-menu-tab"
import { PreviewExportTab } from "./preview-export-tab"
import { MenuBuilderTab } from "../menu-builder/menu-builder-tab"
import { BuffetBuilderTab } from "../menu-builder/buffet-builder-tab"
import { CateringTab } from "./catering-tab"
import { ErrorBoundary } from "../error-boundary"
import { cn } from "@/lib/utils"

export function CateringDashboard() {
  const [builderMode, setBuilderMode] = useState<"plated" | "buffet">("plated")

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
            {/* Plated / Buffet Toggle */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1.5 bg-muted/50 rounded-xl p-1 border border-border/30">
                <button
                  onClick={() => setBuilderMode("plated")}
                  className={cn(
                    "flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all duration-200",
                    builderMode === "plated"
                      ? "bg-white dark:bg-card shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <UtensilsCrossed className="size-3.5" />
                  Plated Items
                </button>
                <button
                  onClick={() => setBuilderMode("buffet")}
                  className={cn(
                    "flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all duration-200",
                    builderMode === "buffet"
                      ? "bg-white dark:bg-card shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <ChefHat className="size-3.5" />
                  Buffet Items
                </button>
              </div>
            </div>

            {builderMode === "plated" ? <MenuBuilderTab /> : <BuffetBuilderTab />}
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