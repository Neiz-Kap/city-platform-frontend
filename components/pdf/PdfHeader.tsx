import React from "react"

import { Text, View } from "@react-pdf/renderer"

import { commonStyles } from "./styles"

export interface PdfHeaderProps {
  title: string
  subtitle?: string
}

/**
 * Reusable PDF header component with title and optional subtitle
 * Used across all report types for consistent formatting
 */
export const PdfHeader: React.FC<PdfHeaderProps> = ({ title, subtitle }) => (
  <View>
    <Text style={commonStyles.header}>{title}</Text>
    {subtitle && <Text style={commonStyles.subtitle}>{subtitle}</Text>}
  </View>
)
