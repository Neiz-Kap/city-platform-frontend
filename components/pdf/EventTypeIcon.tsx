import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';

export type EventType = 'info' | 'warning' | 'incident';

export interface EventTypeIconProps {
  type: EventType;
}

const iconStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    color: 'white',
    fontSize: 8,
    fontWeight: 700,
    textAlign: 'center',
  },
});

const getIconConfig = (type: EventType) => {
  switch (type) {
    case 'info':
      return {
        backgroundColor: '#3b82f6', // blue
        symbol: 'i',
      };
    case 'warning':
      return {
        backgroundColor: '#eab308', // yellow
        symbol: '!',
      };
    case 'incident':
      return {
        backgroundColor: '#ef4444', // red
        symbol: '!',
      };
  }
};

/**
 * Event type icon component for PDF exports
 * Displays colored circle with symbol:
 * - Info: blue circle with "i"
 * - Warning: yellow circle with "!"
 * - Incident: red circle with "!"
 */
export const EventTypeIcon: React.FC<EventTypeIconProps> = ({ type }) => {
  const config = getIconConfig(type);

  return (
    <View style={iconStyles.container}>
      <View
        style={[iconStyles.circle, { backgroundColor: config.backgroundColor }]}
      >
        <Text style={iconStyles.icon}>{config.symbol}</Text>
      </View>
    </View>
  );
};
