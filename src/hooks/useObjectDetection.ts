import { useEffect, useState, useCallback, useRef } from 'react';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';

export const useObjectDetection = (videoRef: React.RefObject<HTMLVideoElement>) => {
  const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const modelRef = useRef<cocoSsd.ObjectDetection | null>(null);

  useEffect(() => {
    const loadModel = async () => {
      try {
        const loadedModel = await cocoSsd.load({
          base: 'lite_mobilenet_v2',
        });
        modelRef.current = loadedModel;
        setModel(loadedModel);
        setIsModelLoaded(true);
      } catch (error) {
        console.error('Error loading object detection model:', error);
      }
    };

    loadModel();
  }, []);

  const detectObjects = useCallback(async (): Promise<cocoSsd.DetectedObject[]> => {
    if (!model || !videoRef.current || videoRef.current.readyState < 2) {
      return [];
    }

    try {
      const predictions = await model.detect(videoRef.current);
      return predictions;
    } catch (error) {
      console.error('Error detecting objects:', error);
      return [];
    }
  }, [model, videoRef]);

  return { detectObjects, isModelLoaded };
};