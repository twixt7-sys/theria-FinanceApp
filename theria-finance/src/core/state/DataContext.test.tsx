import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { TheriaRepository } from '../data/repository';
import type { TheriaData } from '../domain/types';
import { DataProvider, useData } from './DataContext';

const seed = (): TheriaData => ({
  accounts: [
    { id: 'a1', name: 'Wallet', initialBalance: 900, categoryId: 'c1', iconName: 'Wallet', color: '#0f0', createdAt: '2026-07-01T00:00:00.000Z' },
    { id: 'a2', name: 'Savings', initialBalance: 4800, categoryId: 'c1', iconName: 'PiggyBank', color: '#00f', createdAt: '2026-07-01T00:00:00.000Z' },
  ],
  streams: [
    { id: 's1', name: 'Groceries', type: 'expense', iconName: 'Cart', color: '#fa0', createdAt: '2026-07-01T00:00:00.000Z' },
  ],
  categories: [],
  records: [
    { id: 'r1', type: 'income', amount: 800, toAccountId: 'a1', streamId: 's1', date: '2026-07-01', createdAt: '2026-07-01T00:00:00.000Z' },
    { id: 'r2', type: 'expense', amount: 300, fromAccountId: 'a1', streamId: 's1', date: '2026-07-05', createdAt: '2026-07-05T00:00:00.000Z' },
    { id: 'r3', type: 'transfer', amount: 200, fromAccountId: 'a1', toAccountId: 'a2', streamId: 's1', date: '2026-07-06', createdAt: '2026-07-06T00:00:00.000Z' },
  ],
  budgets: [
    { id: 'b1', streamId: 's1', name: 'Groceries', limit: 500, period: 'monthly', startDate: '2026-07-01', endDate: '2026-07-31', createdAt: '2026-07-01T00:00:00.000Z' },
  ],
  savings: [],
});

/**
 * In-memory stand-in so the test exercises the provider, not localStorage.
 * Copy-on-write, like the real repositories — a store that handed out arrays it
 * later mutated would alias React's state and double-apply every write.
 */
function memoryRepository(initial: TheriaData): TheriaRepository {
  let data: TheriaData = structuredClone(initial);
  return {
    async load() {
      return structuredClone(data);
    },
    async put(collection, item) {
      const items = [...data[collection]] as { id: string }[];
      const index = items.findIndex((i) => i.id === item.id);
      if (index === -1) items.push(item);
      else items[index] = item;
      data = { ...data, [collection]: items };
    },
    async remove(collection, id) {
      data = { ...data, [collection]: data[collection].filter((i) => i.id !== id) };
    },
    async replaceAll(next) {
      data = structuredClone(next);
    },
  };
}

const renderData = (data = seed()) => {
  const repository = memoryRepository(data);
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <DataProvider repository={repository}>{children}</DataProvider>
  );
  return renderHook(() => useData(), { wrapper });
};

const balanceOf = (accounts: { id: string; balance: number }[], id: string) =>
  accounts.find((a) => a.id === id)?.balance;

describe('DataProvider', () => {
  it('exposes balances derived from records', async () => {
    const { result } = renderData();

    await waitFor(() => expect(result.current.accounts).toHaveLength(2));

    expect(balanceOf(result.current.accounts, 'a1')).toBe(1200);
    expect(balanceOf(result.current.accounts, 'a2')).toBe(5000);
  });

  // v1 filtered the record out and left the balance wrong. It must self-correct now.
  it('restores the balance when a record is deleted', async () => {
    const { result } = renderData();
    await waitFor(() => expect(result.current.records).toHaveLength(3));

    act(() => result.current.deleteRecord('r2'));

    await waitFor(() => expect(result.current.records).toHaveLength(2));
    expect(balanceOf(result.current.accounts, 'a1')).toBe(1500);
  });

  it('reflects an edited record amount in the balance', async () => {
    const { result } = renderData();
    await waitFor(() => expect(result.current.records).toHaveLength(3));

    act(() => result.current.updateRecord('r2', { amount: 100 }));

    await waitFor(() => expect(balanceOf(result.current.accounts, 'a1')).toBe(1400));
  });

  it('applies a newly added expense to the balance', async () => {
    const { result } = renderData();
    await waitFor(() => expect(result.current.accounts).toHaveLength(2));

    act(() => {
      result.current.addRecord({
        type: 'expense',
        amount: 200,
        fromAccountId: 'a1',
        streamId: 's1',
        date: '2026-07-10',
      });
    });

    await waitFor(() => expect(balanceOf(result.current.accounts, 'a1')).toBe(1000));
  });

  it('derives budget spend from records rather than a stored field', async () => {
    const { result } = renderData();
    await waitFor(() => expect(result.current.budgets).toHaveLength(1));

    // Only r2 (300, July, stream s1) is an expense inside the current month.
    expect(result.current.budgets[0].spent).toBe(300);

    act(() => result.current.deleteRecord('r2'));

    await waitFor(() => expect(result.current.budgets[0].spent).toBe(0));
  });

  it('assigns collision-free ids to new items', async () => {
    const { result } = renderData();
    await waitFor(() => expect(result.current.accounts).toHaveLength(2));

    let created: { id: string } | undefined;
    act(() => {
      created = result.current.addAccount({
        name: 'New',
        initialBalance: 10,
        categoryId: 'c1',
        iconName: 'Wallet',
        color: '#fff',
      });
    });

    expect(created?.id).toBeTruthy();
    expect(created?.id).not.toBe('a1');
    await waitFor(() => expect(result.current.accounts).toHaveLength(3));
    expect(balanceOf(result.current.accounts, created!.id)).toBe(10);
  });
});
