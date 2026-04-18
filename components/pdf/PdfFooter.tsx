import React from 'react';
import { Text } from '@react-pdf/renderer';
import { commonStyles } from "./styles"

export interface PdfFooterProps {
  timestamp?: string;
  fixed?: boolean;
  pageLabel?: string;
  ofLabel?: string;
  generatedLabel?: string;
}

/**
 * Reusable PDF footer component with page numbers and generation timestamp
 * Positioned at bottom of page with fixed positioning
 *
 * Uses render prop to access dynamic pageNumber and totalPages
 * Format: "{pageLabel} X {ofLabel} Y | {generatedLabel}: timestamp"
 *
 * @example
 * // Default (Russian)
 * <PdfFooter timestamp="23.10.2025, 14:30" />
 * // Outputs: "Страница 1 из 4 | Сформирован: 23.10.2025, 14:30"
 *
 * // Custom labels
 * <PdfFooter
 *   timestamp="23.10.2025, 14:30"
 *   pageLabel="Page"
 *   ofLabel="of"
 *   generatedLabel="Generated"
 * />
 * // Outputs: "Page 1 of 4 | Generated: 23.10.2025, 14:30"
 */
export const PdfFooter: React.FC<PdfFooterProps> = ({
  timestamp,
  fixed = true,
  pageLabel = 'Страница',
  ofLabel = 'из',
  generatedLabel = 'Сформирован',
}) => {
  const displayTimestamp = timestamp || new Date().toLocaleString('ru-RU');

  return (
    <Text
      style={commonStyles.footer}
      fixed={fixed}
      render={({ pageNumber, totalPages }) =>
        `${pageLabel} ${pageNumber} ${ofLabel} ${totalPages} | ${generatedLabel}: ${displayTimestamp}`
      }
    />
  );
};
