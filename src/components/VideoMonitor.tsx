import { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, AlertTriangle, CheckCircle, Loader } from 'lucide-react';
import { useFaceDetection } from '../hooks/useFaceDetection';
import { useObjectDetection } from '../hooks/useObjectDetection';
import { ProctoringEvent } from '../types';
import { createEvent, isSuspiciousObject } from '../utils/detectionLogic';

interface VideoMonitorProps {
  isRecording: boolean;
  onEventDetected: (event: ProctoringEvent) => void;
}

export const VideoMonitor = ({ isRecording, onEventDetected }: VideoMonitorProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [currentStatus, setCurrentStatus] = useState<string>('Initializing...');
  const [statusColor, setStatusColor] = useState<'green' | 'yellow' | 'red'>('yellow');

  const { detectFaces, isModelLoaded: isFaceModelLoaded } = useFaceDetection(videoRef);
  const { detectObjects, isModelLoaded: isObjectModelLoaded } = useObjectDetection(videoRef);

  const noFaceTimerRef = useRef<number>(0);
  const focusLostTimerRef = useRef<number>(0);
  const lastFaceCountRef = useRef<number>(0);
  const lastObjectCheckRef = useRef<number>(0);
  const detectedObjectsRef = useRef<Set<string>>(new Set());

  const updateStatus = useCallback((status: string, color: 'green' | 'yellow' | 'red') => {
    setCurrentStatus(status);
    setStatusColor(color);
  }, []);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      updateStatus('Camera access denied', 'red');
    }
  }, [updateStatus]);

  useEffect(() => {
    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [startCamera]);

  const drawDetections = useCallback(() => {
    if (!canvasRef.current || !videoRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const faces = detectFaces();

    faces.forEach(detection => {
      if (detection.boundingBox) {
        const { originX, originY, width, height } = detection.boundingBox;

        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 3;
        ctx.strokeRect(originX, originY, width, height);

        ctx.fillStyle = '#00ff00';
        ctx.font = '16px Arial';
        ctx.fillText('Face', originX, originY - 5);
      }
    });
  }, [detectFaces]);

  useEffect(() => {
    if (!isRecording || !isFaceModelLoaded || !isObjectModelLoaded) return;

    const monitoringInterval = setInterval(async () => {
      const now = Date.now();

      const faces = detectFaces();
      const faceCount = faces.length;

      if (faceCount === 0) {
        noFaceTimerRef.current += 1;
        focusLostTimerRef.current += 1;

        if (noFaceTimerRef.current === 10) {
          const event = createEvent('no_face', 'No face detected for 10 seconds', 'high');
          onEventDetected(event);
          updateStatus('⚠️ No face detected!', 'red');
        } else if (focusLostTimerRef.current >= 5) {
          updateStatus('⚠️ Candidate not visible', 'red');
        }
      } else if (faceCount === 1) {
        if (noFaceTimerRef.current >= 10) {
          const event = createEvent('face_detected', 'Face detected again', 'low');
          onEventDetected(event);
        }

        noFaceTimerRef.current = 0;
        focusLostTimerRef.current = 0;
        updateStatus('✓ Candidate focused', 'green');
      } else if (faceCount > 1) {
        if (lastFaceCountRef.current <= 1) {
          const event = createEvent('multiple_faces', `${faceCount} faces detected in frame`, 'high');
          onEventDetected(event);
        }
        updateStatus(`⚠️ Multiple faces detected (${faceCount})`, 'red');
      }

      lastFaceCountRef.current = faceCount;

      if (now - lastObjectCheckRef.current > 3000) {
        const objects = await detectObjects();

        objects.forEach(obj => {
          if (isSuspiciousObject(obj.class)) {
            const objKey = `${obj.class}-${Math.floor(now / 5000)}`;

            if (!detectedObjectsRef.current.has(objKey)) {
              detectedObjectsRef.current.add(objKey);
              const event = createEvent(
                'suspicious_object',
                `Suspicious item detected: ${obj.class}`,
                'high'
              );
              onEventDetected(event);
            }
          }
        });

        lastObjectCheckRef.current = now;
      }

      drawDetections();
    }, 1000);

    return () => clearInterval(monitoringInterval);
  }, [
    isRecording,
    isFaceModelLoaded,
    isObjectModelLoaded,
    detectFaces,
    detectObjects,
    onEventDetected,
    updateStatus,
    drawDetections,
  ]);

  return (
    <div className="relative">
      <div className="relative rounded-lg overflow-hidden bg-gray-900 shadow-2xl">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-auto"
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
        />

        {!isFaceModelLoaded || !isObjectModelLoaded ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="text-center text-white">
              <Loader className="w-12 h-12 animate-spin mx-auto mb-4" />
              <p className="text-lg">Loading AI models...</p>
            </div>
          </div>
        ) : null}

        <div className="absolute top-4 left-4 flex items-center gap-2">
          {isRecording ? (
            <div className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full shadow-lg">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
              <span className="font-semibold">Recording</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-gray-700 text-white px-4 py-2 rounded-full shadow-lg">
              <Camera className="w-4 h-4" />
              <span className="font-semibold">Standby</span>
            </div>
          )}
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${
              statusColor === 'green'
                ? 'bg-green-500 text-white'
                : statusColor === 'yellow'
                ? 'bg-yellow-500 text-gray-900'
                : 'bg-red-500 text-white'
            }`}
          >
            {statusColor === 'green' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
            <span className="font-semibold">{currentStatus}</span>
          </div>
        </div>
      </div>
    </div>
  );
};