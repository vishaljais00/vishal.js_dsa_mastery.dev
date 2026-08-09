import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cheat-sheet',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-slate-50 dark:bg-slate-950 min-h-screen py-8 transition-colors">
      <div class="max-w-7xl mx-auto px-4">
        
        <div class="mb-8">
          <span class="text-xs font-mono font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest block">Day 29 Master Reference</span>
          <h1 class="text-3xl font-extrabold text-slate-900 dark:text-white m-0">DSA Pattern Recognition Cheat Sheet</h1>
          <p class="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            Quick reference guide for identifying data structures, patterns, time & space complexities during coding interviews.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div *ngFor="let pattern of patterns" class="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div class="flex items-center justify-between mb-3">
              <h2 class="text-lg font-extrabold text-slate-900 dark:text-white m-0">{{pattern.title}}</h2>
              <span class="px-2.5 py-1 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-mono text-[11px] font-bold">
                {{pattern.complexity}}
              </span>
            </div>

            <p class="text-xs text-slate-600 dark:text-slate-300 font-medium mb-3">{{pattern.whenToUse}}</p>

            <div class="mb-3">
              <span class="text-[10px] font-mono text-slate-400 block mb-1">Key Signals:</span>
              <div class="flex flex-wrap gap-1">
                <span *ngFor="let key of pattern.keywords" class="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-mono font-semibold">
                  {{key}}
                </span>
              </div>
            </div>

            <pre class="text-[11px] p-3 bg-slate-900 dark:bg-slate-950 text-emerald-300 rounded-xl font-mono overflow-x-auto border border-slate-800 leading-relaxed">{{pattern.code}}</pre>
          </div>
        </div>

      </div>
    </div>
  `
})
export class CheatSheetComponent {
  patterns = [
    {
      title: 'HashMap / Frequency Map',
      complexity: 'Time O(n) | Space O(n)',
      whenToUse: 'When needing O(1) lookups, counting frequencies, or checking duplicates.',
      keywords: ['Two Sum', 'Anagram', 'Subarray Sum', 'Duplicates'],
      code: `const map = new Map();\nfor (const item of arr) {\n  map.set(item, (map.get(item) || 0) + 1);\n}`
    },
    {
      title: 'Two Pointers',
      complexity: 'Time O(n) | Space O(1)',
      whenToUse: 'Sorted arrays, pair searches from opposite ends, or palindrome validation.',
      keywords: ['Sorted Array', 'Pair Sum', 'Palindrome', 'Container'],
      code: `let left = 0, right = arr.length - 1;\nwhile (left < right) {\n  if (condition) left++;\n  else right--;\n}`
    },
    {
      title: 'Sliding Window',
      complexity: 'Time O(n) | Space O(k)',
      whenToUse: 'Contiguous subarray or substring problems with length/condition constraints.',
      keywords: ['Subarray', 'Substring', 'Longest', 'Minimum Window'],
      code: `let left = 0;\nfor (let right = 0; right < arr.length; right++) {\n  // Expand right\n  while (invalid) left++; // Shrink left\n}`
    },
    {
      title: 'Binary Search',
      complexity: 'Time O(log n) | Space O(1)',
      whenToUse: 'Searching target in sorted array or monotonic search space.',
      keywords: ['Sorted', 'O(log n)', 'Rotated Array', 'Search Range'],
      code: `let left = 0, right = nums.length - 1;\nwhile (left <= right) {\n  const mid = Math.floor((left + right) / 2);\n  if (nums[mid] === target) return mid;\n}`
    },
    {
      title: 'Fast & Slow Pointers',
      complexity: 'Time O(n) | Space O(1)',
      whenToUse: 'Detecting cycles in Linked Lists or finding the middle node.',
      keywords: ['Linked List Cycle', 'Middle Node', 'Floyd Algorithm'],
      code: `let slow = head, fast = head;\nwhile (fast && fast.next) {\n  slow = slow.next;\n  fast = fast.next.next;\n  if (slow === fast) return true;\n}`
    },
    {
      title: 'Stack & Monotonic Stack',
      complexity: 'Time O(n) | Space O(n)',
      whenToUse: 'Matching nested structures or finding next greater/smaller element.',
      keywords: ['Valid Parentheses', 'Next Greater', 'Daily Temperatures'],
      code: `const stack = [];\nfor (const char of s) {\n  if (isOpen(char)) stack.push(char);\n  else if (stack.pop() !== match(char)) return false;\n}`
    }
  ];
}
