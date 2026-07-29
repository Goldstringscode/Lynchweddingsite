"use client"

import { Component, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw } from "lucide-react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("ErrorBoundary caught:", error.message, error.stack)
    console.error("Component stack:", errorInfo?.componentStack)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="p-8 max-w-2xl mx-auto">
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="size-5 text-destructive" />
              </div>
              <div>
                <h3 className="font-serif text-base font-medium text-destructive">Component Error</h3>
                <p className="text-xs text-muted-foreground">
                  An error occurred while rendering this section.
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-background/50 border p-3">
              <p className="text-xs font-mono text-destructive break-all">
                {this.state.error?.message || "Unknown error"}
              </p>
              {this.state.error?.stack && (
                <details className="mt-2">
                  <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                    Stack trace
                  </summary>
                  <pre className="mt-2 text-[10px] text-muted-foreground font-mono whitespace-pre-wrap max-h-40 overflow-y-auto">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              <RefreshCw className="size-3.5" />
              Retry
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}