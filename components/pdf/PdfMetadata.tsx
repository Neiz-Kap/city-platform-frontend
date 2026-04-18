import React from 'react';
import { Text, View } from '@react-pdf/renderer';
import { commonStyles } from "./styles"

export interface PdfMetadataProps {
  systemName?: string;
  period?: string;
  filters?: Array<{ label: string; value: string }>;
  systemLabel?: string;
  periodLabel?: string;
  filtersLabel?: string;
}

/**
 * PDF metadata component for displaying structured document info
 * Shows system name, date range, and applied filters in a readable format
 */
export const PdfMetadata: React.FC<PdfMetadataProps> = ({
  systemName,
  period,
  filters,
  systemLabel = 'Система',
  periodLabel = 'Период',
  filtersLabel = 'Фильтры',
}) => {
  // Don't render if no metadata
  if (!systemName && !period && (!filters || filters.length === 0)) {
    return null;
  }

  return (
    <View style={commonStyles.summary}>
      {systemName && (
        <View style={commonStyles.summaryText}>
          <Text style={commonStyles.summaryBold}>{systemLabel}: </Text>
          <Text>{systemName}</Text>
        </View>
      )}

      {period && (
        <View style={commonStyles.summaryText}>
          <Text style={commonStyles.summaryBold}>{periodLabel}: </Text>
          <Text>{period}</Text>
        </View>
      )}

      {filters && filters.length > 0 && (
        <View>
          <Text style={[commonStyles.summaryText, commonStyles.summaryBold]}>
            {filtersLabel}:
          </Text>
          {filters.map((filter, index) => (
            <View key={index} style={{ marginLeft: 10, marginBottom: 3 }}>
              <Text style={commonStyles.summaryBold}>{filter.label}: </Text>
              <Text>{filter.value}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};
