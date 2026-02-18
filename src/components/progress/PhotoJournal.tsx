// src/components/progress/PhotoJournal.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Camera, Upload, X, ArrowLeftRight, Calendar } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { useAuthStore } from '@/store/authStore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc, collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';
import { format } from 'date-fns';
import { compressImageToFile, generateId } from '@/lib/utils';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface ProgressPhoto {
  id: string;
  photoURL: string;
  type: 'front' | 'side' | 'back';
  date: string;
  weight?: number;
  note?: string;
}

export default function PhotoJournal() {
  const { user, userProfile } = useAuthStore();
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [selectedType, setSelectedType] = useState<'front' | 'side' | 'back'>('front');
  const [uploading, setUploading] = useState(false);
  const [compareLeft, setCompareLeft] = useState<ProgressPhoto | null>(null);
  const [compareRight, setCompareRight] = useState<ProgressPhoto | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<ProgressPhoto | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) fetchPhotos();
  }, [user]);

  const fetchPhotos = async () => {
    if (!user) return;
    try {
      const ref2 = collection(db, 'users', user.uid, 'progressPhotos');
      const q = query(ref2, orderBy('date', 'desc'));
      const snap = await getDocs(q);
      setPhotos(snap.docs.map((d) => ({ id: d.id, ...d.data() } as ProgressPhoto)));
    } catch (err) {
      console.error('Error fetching photos:', err);
    }
  };

  const handleUpload = async (file: File) => {
    if (!user) return;
    setUploading(true);

    try {
      const compressed = await compressImageToFile(file, 800);
      const photoId = generateId();
      const storageRef = ref(storage, `users/${user.uid}/progress/${photoId}.jpg`);
      await uploadBytes(storageRef, compressed);
      const url = await getDownloadURL(storageRef);

      const photoData: ProgressPhoto = {
        id: photoId,
        photoURL: url,
        type: selectedType,
        date: format(new Date(), 'yyyy-MM-dd'),
        weight: userProfile?.metrics?.currentWeight,
      };

      await setDoc(doc(db, 'users', user.uid, 'progressPhotos', photoId), photoData);
      toast.success('Progress photo saved! ðŸ“¸');
      setShowUploadModal(false);
      fetchPhotos();
    } catch (err) {
      toast.error('Failed to upload photo');
      console.error(err);
    }
    setUploading(false);
  };

  const frontPhotos = photos.filter((p) => p.type === 'front');
  const sidePhotos = photos.filter((p) => p.type === 'side');
  const backPhotos = photos.filter((p) => p.type === 'back');

  // Group by date
  const groupedByDate = photos.reduce<Record<string, ProgressPhoto[]>>((acc, photo) => {
    if (!acc[photo.date]) acc[photo.date] = [];
    acc[photo.date].push(photo);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {/* Actions */}
      <div className="flex gap-2">
        <Button onClick={() => setShowUploadModal(true)} variant="primary" fullWidth>
          <Camera className="mr-2 h-4 w-4" />
          Take Progress Photo
        </Button>
        <Button
          onClick={() => setShowCompareModal(true)}
          variant="outline"
          disabled={photos.length < 2}
        >
          <ArrowLeftRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Tips */}
      <Card padding="sm">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          ðŸ’¡ For best comparisons: same lighting, same pose, same time of day. Take front, side, and back views.
        </p>
      </Card>

      {/* Photo Gallery */}
      {Object.keys(groupedByDate).length > 0 ? (
        Object.entries(groupedByDate).map(([date, datePhotos]) => (
          <div key={date}>
            <div className="mb-2 flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-xs font-semibold text-gray-500">{format(new Date(date), 'MMM d, yyyy')}</span>
              {datePhotos[0].weight && (
                <span className="text-xs text-gray-400">{datePhotos[0].weight} kg</span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {datePhotos.map((photo) => (
                <button
                  key={photo.id}
                  onClick={() => setSelectedPhoto(photo)}
                  className="relative aspect-[3/4] overflow-hidden rounded-xl"
                >
                  <img
                    src={photo.photoURL}
                    alt={`Progress ${photo.type}`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                  <span className="absolute bottom-1 left-1 rounded bg-black/50 px-1.5 py-0.5 text-[9px] font-bold capitalize text-white">
                    {photo.type}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))
      ) : (
        <Card>
          <div className="py-8 text-center">
            <Camera className="mx-auto mb-3 h-10 w-10 text-gray-300" />
            <p className="text-sm text-gray-500">No progress photos yet</p>
            <p className="text-xs text-gray-400">Take your first one to track your journey!</p>
          </div>
        </Card>
      )}

      {/* Upload Modal */}
      <Modal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} title="Progress Photo">
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Photo Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['front', 'side', 'back'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={cn(
                    'rounded-xl py-3 text-center text-xs font-bold capitalize transition-all',
                    selectedType === type
                      ? 'bg-brand-purple text-white dark:bg-brand-lavender dark:text-brand-dark'
                      : 'bg-gray-100 text-gray-500 dark:bg-brand-surface'
                  )}
                >
                  {type === 'front' ? 'ðŸ§' : type === 'side' ? 'ðŸ§â€â™‚ï¸' : 'ðŸ”™'} {type}
                </button>
              ))}
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload(file);
              e.target.value = '';
            }}
          />

          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="primary"
            fullWidth
            loading={uploading}
          >
            <Camera className="mr-2 h-4 w-4" />
            Take / Upload Photo
          </Button>
        </div>
      </Modal>

      {/* Compare Modal */}
      <Modal isOpen={showCompareModal} onClose={() => setShowCompareModal(false)} title="Compare Photos">
        <div className="space-y-4">
          <p className="text-xs text-gray-500">Select two dates to compare side by side</p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="mb-1 text-xs font-bold text-gray-500">Before</p>
              <div className="max-h-40 space-y-1 overflow-y-auto">
                {photos.map((p) => (
                  <button
                    key={p.id + 'L'}
                    onClick={() => setCompareLeft(p)}
                    className={cn(
                      'w-full rounded-lg px-2 py-1.5 text-left text-xs transition-all',
                      compareLeft?.id === p.id
                        ? 'bg-brand-purple text-white dark:bg-brand-lavender dark:text-brand-dark'
                        : 'bg-gray-50 dark:bg-brand-surface/50'
                    )}
                  >
                    {p.date} Â· {p.type}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-1 text-xs font-bold text-gray-500">After</p>
              <div className="max-h-40 space-y-1 overflow-y-auto">
                {photos.map((p) => (
                  <button
                    key={p.id + 'R'}
                    onClick={() => setCompareRight(p)}
                    className={cn(
                      'w-full rounded-lg px-2 py-1.5 text-left text-xs transition-all',
                      compareRight?.id === p.id
                        ? 'bg-brand-purple text-white dark:bg-brand-lavender dark:text-brand-dark'
                        : 'bg-gray-50 dark:bg-brand-surface/50'
                    )}
                  >
                    {p.date} Â· {p.type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {compareLeft && compareRight && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <img src={compareLeft.photoURL} alt="Before" className="w-full rounded-xl object-cover" />
                <p className="mt-1 text-center text-[10px] text-gray-400">
                  {compareLeft.date} {compareLeft.weight && `Â· ${compareLeft.weight}kg`}
                </p>
              </div>
              <div>
                <img src={compareRight.photoURL} alt="After" className="w-full rounded-xl object-cover" />
                <p className="mt-1 text-center text-[10px] text-gray-400">
                  {compareRight.date} {compareRight.weight && `Â· ${compareRight.weight}kg`}
                </p>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Full Photo View */}
      <Modal isOpen={!!selectedPhoto} onClose={() => setSelectedPhoto(null)} title="">
        {selectedPhoto && (
          <div>
            <img src={selectedPhoto.photoURL} alt="Progress" className="w-full rounded-xl" />
            <div className="mt-2 text-center text-xs text-gray-500">
              {format(new Date(selectedPhoto.date), 'MMMM d, yyyy')} Â· {selectedPhoto.type}
              {selectedPhoto.weight && ` Â· ${selectedPhoto.weight} kg`}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
