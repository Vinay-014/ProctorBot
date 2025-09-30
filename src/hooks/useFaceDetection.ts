import { useEffect, useRef, useState, useCallback } from 'react';
import { FaceDetector, FilesetResolver, Detection } from '@mediapipe/tasks-vision';

export const useFaceDetection = (videoRef: React.RefObject<HTMLVideoElement>) => {
  const [faceDetector, setFaceDetector] = useState<FaceDetector | null>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const detectorRef = useRef<FaceDetector | null>(null);

  useEffect(() => {
    const initializeFaceDetector = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );

        const detector = await FaceDetector.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          minDetectionConfidence: 0.5,
        });

        detectorRef.current = detector;
        setFaceDetector(detector);
        setIsModelLoaded(true);
      } catch (error) {
        console.error('Error initializing face detector:', error);
      }
    };

    initializeFaceDetector();

    return () => {
      if (detectorRef.current) {
        detectorRef.current.close();
      }
    };
  }, []);

  const detectFaces = useCallback((): Detection[] => {
    if (!faceDetector || !videoRef.current || videoRef.current.readyState < 2) {
      return [];
    }

    try {
      const timestamp = performance.now();
      const result = faceDetector.detectForVideo(videoRef.current, timestamp);
      return result.detections || [];
    } catch (error) {
      console.error('Error detecting faces:', error);
      return [];
    }
  }, [faceDetector, videoRef]);

  return { detectFaces, isModelLoaded };
};