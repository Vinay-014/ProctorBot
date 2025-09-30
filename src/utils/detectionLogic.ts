import { ProctoringEvent, DetectionStats } from '../types';

export const generateEventId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const createEvent = (
  type: ProctoringEvent['type'],
  description: string,
  severity: ProctoringEvent['severity']
): ProctoringEvent => {
  return {
    id: generateEventId(),
    timestamp: Date.now(),
    type,
    description,
    severity,
  };
};

export const calculateIntegrityScore = (stats: DetectionStats): number => {
  let score = 100;

  score -= stats.focusLostCount * 2;
  score -= stats.noFaceCount * 5;
  score -= stats.multipleFacesCount * 10;
  score -= stats.suspiciousObjectCount * 15;

  return Math.max(0, Math.min(100, score));
};

export const calculateStats = (events: ProctoringEvent[]): DetectionStats => {
  return {
    focusLostCount: events.filter(e => e.type === 'focus_lost').length,
    noFaceCount: events.filter(e => e.type === 'no_face').length,
    multipleFacesCount: events.filter(e => e.type === 'multiple_faces').length,
    suspiciousObjectCount: events.filter(e => e.type === 'suspicious_object').length,
    totalDuration: 0,
  };
};

export const formatDuration = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
};

export const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString();
};

export const SUSPICIOUS_OBJECTS = [
  'cell phone',
  'book',
  'laptop',
  'keyboard',
  'mouse',
  'remote',
  'tv',
  'monitor',
];

export const isSuspiciousObject = (label: string): boolean => {
  const lowerLabel = label.toLowerCase();
  return SUSPICIOUS_OBJECTS.some(obj => lowerLabel.includes(obj));
};