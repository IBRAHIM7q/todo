"use client"

import * as React from "react"
import { Palette } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const colorSchemes = [
  {
    name: "Purple",
    value: "purple",
    colors: {
      primary: "from-purple-400 via-pink-400 to-blue-400",
      bg: "from-slate-900 via-purple-900 to-slate-900",
      card: "border-purple-500/20",
      button: "bg-purple-600 hover:bg-purple-500",
    }
  },
  {
    name: "Blue",
    value: "blue",
    colors: {
      primary: "from-blue-400 via-cyan-400 to-teal-400",
      bg: "from-slate-900 via-blue-900 to-slate-900",
      card: "border-blue-500/20",
      button: "bg-blue-600 hover:bg-blue-500",
    }
  },
  {
    name: "Green",
    value: "green",
    colors: {
      primary: "from-green-400 via-emerald-400 to-teal-400",
      bg: "from-slate-900 via-green-900 to-slate-900",
      card: "border-green-500/20",
      button: "bg-green-600 hover:bg-green-500",
    }
  },
  {
    name: "Orange",
    value: "orange",
    colors: {
      primary: "from-orange-400 via-red-400 to-pink-400",
      bg: "from-slate-900 via-orange-900 to-slate-900",
      card: "border-orange-500/20",
      button: "bg-orange-600 hover:bg-orange-500",
    }
  },
  {
    name: "Rose",
    value: "rose",
    colors: {
      primary: "from-rose-400 via-pink-400 to-fuchsia-400",
      bg: "from-slate-900 via-rose-900 to-slate-900",
      card: "border-rose-500/20",
      button: "bg-rose-600 hover:bg-rose-500",
    }
  }
]

interface ColorSchemeSelectorProps {
  onColorChange: (scheme: string) => void
  currentColor: string
}

export function ColorSchemeSelector({ onColorChange, currentColor }: ColorSchemeSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="bg-white/10 border-white/20 hover:bg-white/20"
        >
          <Palette className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Select color scheme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-black/80 backdrop-blur-md border-white/20">
        {colorSchemes.map((scheme) => (
          <DropdownMenuItem
            key={scheme.value}
            onClick={() => onColorChange(scheme.value)}
            className={`flex items-center space-x-2 cursor-pointer ${
              currentColor === scheme.value ? "bg-white/10" : ""
            }`}
          >
            <div
              className="w-4 h-4 rounded-full bg-gradient-to-r from-purple-400 to-pink-400"
              style={{
                background: `linear-gradient(to right, ${scheme.colors.primary.split(" ").join(", ")})`
              }}
            />
            <span className="text-white">{scheme.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}