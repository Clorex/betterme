// src/components/nutrition/BarcodeScanner.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Camera, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { cn } from '@/lib/utils';

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onFoodFound: (food: any) => void;
}

export default function BarcodeScanner({
  isOpen,
  onClose,
  onFoodFound,
}: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const [scannedCode, setScannedCode] = useState('');
  const [loading, setLoading] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setScanning(true);
        scanLoop();
      }
    } catch (err) {
      setError('Camera access denied. Please enable camera permission.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setScanning(false);
  };

  const scanLoop = async () => {
    // Using dynamic import for quagga2
    try {
      const Quagga = (await import('@ericblade/quagga2')).default;

      if (!videoRef.current || !scanning) return;

      // Initialize Quagga with video element
      Quagga.init(
        {
          inputStream: {
            type: 'LiveStream',
            target: videoRef.current,
            constraints: {
              facingMode: 'environment',
            },
          },
          decoder: {
            readers: [
              'ean_reader',
              'ean_8_reader',
              'upc_reader',
              'upc_e_reader',
            ],
          },
          locate: true,
        },
        (err: any) => {
          if (err) {
            console.error('Quagga init error:', err);
            return;
          }
          Quagga.start();
        }
      );

      Quagga.onDetected(async (result: any) => {
        const code = result.codeResult.code;
        if (code && code !== scannedCode) {
          setScannedCode(code);
          Quagga.stop();
          await lookupBarcode(code);
        }
      });
    } catch (err) {
      console.error('Quagga import error:', err);
      setError('Barcode scanner not available. Try manual search.');
    }
  };

  const lookupBarcode = async (barcode: string) => {
    setLoading(true);
    try {
      // Use Open Food Facts API (free)
      const response = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
      );
      const data = await response.json();

      if (data.status === 1 && data.product) {
        const product = data.product;
        const nutriments = product.nutriments || {};

        const food = {
          name: product.product_name || 'Unknown Product',
          brand: product.brands || '',
          servingSize: product.serving_size || '100g',
          calories: Math.round(nutriments['energy-kcal_100g'] || nutriments['energy-kcal'] || 0),
          protein: Math.round(nutriments.proteins_100g || nutriments.proteins || 0),
          carbs: Math.round(nutriments.carbohydrates_100g || nutriments.carbohydrates || 0),
          fat: Math.round(nutriments.fat_100g || nutriments.fat || 0),
          fiber: Math.round(nutriments.fiber_100g || nutriments.fiber || 0),
          sugar: Math.round(nutriments.sugars_100g || nutriments.sugars || 0),
          sodium: Math.round((nutriments.sodium_100g || nutriments.sodium || 0) * 1000),
          image: product.image_url || '',
          barcode,
        };

        onFoodFound(food);
        onClose();
      } else {
        setError('Food not found. Try searching manually.');
        setScannedCode('');
      }
    } catch (err) {
      setError('Failed to look up barcode. Check your connection.');
      setScannedCode('');
    }
    setLoading(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Scan Barcode">
      <div className="space-y-4">
        <div className="relative overflow-hidden rounded-2xl bg-black">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full"
          />
          {/* Scanning overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-48 w-48 border-2 border-brand-lavender/60">
              <div className="absolute left-0 top-0 h-6 w-6 border-l-4 border-t-4 border-brand-lavender" />
              <div className="absolute right-0 top-0 h-6 w-6 border-r-4 border-t-4 border-brand-lavender" />
              <div className="absolute bottom-0 left-0 h-6 w-6 border-b-4 border-l-4 border-brand-lavender" />
              <div className="absolute bottom-0 right-0 h-6 w-6 border-b-4 border-r-4 border-brand-lavender" />
              {/* Scanning line */}
              {scanning && (
                <div className="animate-scan absolute left-0 right-0 h-0.5 bg-brand-lavender" />
              )}
            </div>
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Point your camera at a barcode
        </p>

        {loading && (
          <div className="flex items-center justify-center gap-2 text-sm text-brand-purple dark:text-brand-lavender">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-purple border-t-transparent" />
            Looking up product...
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 dark:bg-red-900/20">
            <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-500" />
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
