export interface ProctoringEvent {
  id: string;
  timestamp: number;
  type: 'focus_lost' | 'no_face' | 'multiple_faces' | 'suspicious_object' | 'focus_regained' | 'face_detected';
  description: string;
  severity: 'low' | 'medium' | 'high';
}

export interface SessionData {
  candidateName: string;
  startTime: number;
  endTime?: number;
  events: ProctoringEvent[];
  duration?: number;
  integrityScore?: number;
}

export interface DetectionStats {
  focusLostCount: number;
  noFaceCount: number;
  multipleFacesCount: number;
  suspiciousObjectCount: number;
  totalDuration: number;
}