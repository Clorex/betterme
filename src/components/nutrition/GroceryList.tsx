// src/components/nutrition/GroceryList.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  ShoppingCart,
  Check,
  Plus,
  Trash2,
  Share2,
  Copy,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuthStore } from '@/store/authStore';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format, startOfWeek } from 'date-fns';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface GroceryItem {
  name: string;
  quantity: string;
  unit: string;
  category: string;
  checked: boolean;
}

const categoryOrder = ['produce', 'meat', 'dairy', 'bakery', 'pantry', 'frozen', 'other'];
const categoryLabels: Record<string, { label: string; emoji: string }> = {
  produce: { label: 'Produce', emoji: '🥬' },
  meat: { label: 'Meat & Fish', emoji: '🥩' },
  dairy: { label: 'Dairy', emoji: '🥛' },
  bakery: { label: 'Bakery & Grains', emoji: '🍞' },
  pantry: { label: 'Pantry & Canned', emoji: '🥫' },
  frozen: { label: 'Frozen', emoji: '❄️' },
  other: { label: 'Other', emoji: '🧴' },
};

export default function GroceryList() {
  const { user } = useAuthStore();
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGroceryList();
  }, [user]);

  const loadGroceryList = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');

      // First try loading from dedicated grocery doc
      const groceryDoc = await getDoc(doc(db, 'users', user.uid, 'groceryLists', weekStart));
      if (groceryDoc.exists()) {
        setItems(groceryDoc.data().items || []);
        setLoading(false);
        return;
      }

      // If no grocery list, try generating from meal plan
      const planDoc = await getDoc(doc(db, 'mealPlans', `${user.uid}_${weekStart}`));
      if (planDoc.exists() && planDoc.data().groceryList) {
        const groceryItems = planDoc.data().groceryList.map((item: any) => ({
          ...item,
          checked: false,
        }));
        setItems(groceryItems);
        await saveGroceryList(groceryItems);
      }
    } catch (err) {
      console.error('Error loading grocery list:', err);
    }
    setLoading(false);
  };

  const saveGroceryList = async (itemsToSave: GroceryItem[]) => {
    if (!user) return;
    const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
    try {
      await setDoc(
        doc(db, 'users', user.uid, 'groceryLists', weekStart),
        { items: itemsToSave, updatedAt: new Date().toISOString() }
      );
    } catch (err) {
      console.error('Error saving grocery list:', err);
    }
  };

  const toggleItem = (index: number) => {
    const updated = items.map((item, i) =>
      i === index ? { ...item, checked: !item.checked } : item
    );
    setItems(updated);
    saveGroceryList(updated);
  };

  const removeItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
    saveGroceryList(updated);
  };

  const addItem = () => {
    if (!newItemName.trim()) return;
    const newItem: GroceryItem = {
      name: newItemName.trim(),
      quantity: '',
      unit: '',
      category: 'other',
      checked: false,
    };
    const updated = [...items, newItem];
    setItems(updated);
    saveGroceryList(updated);
    setNewItemName('');
  };

  const clearCompleted = () => {
    const updated = items.filter((item) => !item.checked);
    setItems(updated);
    saveGroceryList(updated);
    toast.success('Completed items cleared');
  };

  const shareList = async () => {
    const unchecked = items.filter((i) => !i.checked);
    const text = unchecked
      .map((i) => `☐ ${i.quantity ? `${i.quantity} ${i.unit} ` : ''}${i.name}`)
      .join('\n');

    const shareText = `🛒 BetterME Grocery List\n\n${text}`;

    if (navigator.share) {
      try {
        await navigator.share({ text: shareText });
      } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(shareText);
      toast.success('List copied to clipboard!');
    }
  };

  // Group by category
  const groupedItems = useMemo(() => {
    const groups: Record<string, { item: GroceryItem; index: number }[]> = {};
    items.forEach((item, index) => {
      const cat = item.category || 'other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push({ item, index });
    });
    return groups;
  }, [items]);

  const checkedCount = items.filter((i) => i.checked).length;

  if (loading) {
    return (
      <Card>
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-purple border-t-transparent" />
        </div>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card>
        <div className="py-8 text-center">
          <ShoppingCart className="mx-auto mb-3 h-12 w-12 text-gray-300" />
          <h3 className="font-heading text-base font-bold text-brand-dark dark:text-brand-white">
            No Grocery List Yet
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Generate a meal plan first, and your grocery list will appear here automatically.
          </p>
          <div className="mt-4">
            <div className="flex gap-2">
              <Input
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="Add item manually"
                onKeyDown={(e) => e.key === 'Enter' && addItem()}
              />
              <Button onClick={addItem} variant="primary" size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress */}
      <Card padding="sm">
        <div className="flex items-center justify-between px-2 py-1">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            {checkedCount}/{items.length} items checked
          </span>
          <div className="flex gap-2">
            <button
              onClick={clearCompleted}
              disabled={checkedCount === 0}
              className="text-xs font-semibold text-red-500 disabled:opacity-30"
            >
              Clear Done
            </button>
            <button onClick={shareList} className="text-xs font-semibold text-brand-purple dark:text-brand-lavender">
              <Share2 className="inline h-3.5 w-3.5" /> Share
            </button>
          </div>
        </div>
        <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-200 px-2 dark:bg-gray-700">
          <div
            className="h-full rounded-full bg-green-500 transition-all duration-300"
            style={{ width: `${items.length > 0 ? (checkedCount / items.length) * 100 : 0}%` }}
          />
        </div>
      </Card>

      {/* Add item */}
      <div className="flex gap-2">
        <Input
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          placeholder="Add custom item..."
          onKeyDown={(e) => e.key === 'Enter' && addItem()}
        />
        <Button onClick={addItem} variant="primary" size="sm" disabled={!newItemName.trim()}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Grouped Items */}
      {categoryOrder.map((cat) => {
        const group = groupedItems[cat];
        if (!group || group.length === 0) return null;
        const catInfo = categoryLabels[cat] || categoryLabels.other;

        return (
          <Card key={cat} padding="sm">
            <h3 className="mb-2 px-2 text-sm font-bold text-gray-600 dark:text-gray-300">
              {catInfo.emoji} {catInfo.label}
            </h3>
            <div className="space-y-0.5">
              {group.map(({ item, index }) => (
                <div
                  key={index}
                  className="flex items-center gap-2 rounded-xl px-2 py-2"
                >
                  <button
                    onClick={() => toggleItem(index)}
                    className={cn(
                      'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all',
                      item.checked
                        ? 'border-green-500 bg-green-500'
                        : 'border-gray-300 dark:border-gray-600'
                    )}
                  >
                    {item.checked && <Check className="h-3.5 w-3.5 text-white" />}
                  </button>
                  <span
                    className={cn(
                      'flex-1 text-sm',
                      item.checked
                        ? 'text-gray-400 line-through'
                        : 'text-gray-700 dark:text-gray-300'
                    )}
                  >
                    {item.quantity && (
                      <span className="font-semibold">{item.quantity} {item.unit} </span>
                    )}
                    {item.name}
                  </span>
                  <button
                    onClick={() => removeItem(index)}
                    className="text-gray-300 active:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
}