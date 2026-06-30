'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
} from '@/server/actions/category'
import { Select } from '@/components/ui/Select'
import type { CategorySummary } from '@/server/services/category.service'

const COLOR_PRESETS = [
  '#059669', '#16a34a', '#0891b2', '#2563eb', '#7c3aed',
  '#9333ea', '#db2777', '#e11d48', '#dc2626', '#d97706',
  '#ca8a04', '#64748b', '#475569', '#27272a', '#0f172a',
]

interface EditingState {
  id: string
  name: string
  color: string
  type: 'income' | 'expense' | 'transfer'
}

interface AddFormState {
  name: string
  type: 'income' | 'expense' | 'transfer'
  color: string
}

export function CategoryManager({ initialCategories }: { initialCategories: CategorySummary[] }) {
  const [categories, setCategories] = useState(initialCategories)
  const [editing, setEditing] = useState<EditingState | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [addForm, setAddForm] = useState<AddFormState>({ name: '', type: 'expense', color: '#059669' })
  const [addError, setAddError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const addNameRef = useRef<HTMLInputElement>(null)

  // Focus add name when showing form
  useEffect(() => {
    if (showAdd) {
      const id = requestAnimationFrame(() => { addNameRef.current?.focus() })
      return () => cancelAnimationFrame(id)
    }
  }, [showAdd])

  const userCategories = categories.filter((c) => !c.isSystem)
  const systemCategories = categories.filter((c) => c.isSystem)

  function startEdit(cat: CategorySummary) {
    setEditing({ id: cat._id, name: cat.name, color: cat.color, type: cat.type })
    setError(null)
  }

  function cancelEdit() {
    setEditing(null)
    setError(null)
  }

  function handleSaveEdit() {
    if (!editing) return
    setError(null)
    startTransition(async () => {
      const result = await updateCategoryAction(editing.id, {
        name: editing.name,
        color: editing.color,
        type: editing.type,
      })
      if (!result.ok) { setError(result.error); return }
      setCategories((prev) =>
        prev.map((c) =>
          c._id === editing.id
            ? { ...c, name: editing.name, color: editing.color, type: editing.type }
            : c,
        ),
      )
      setEditing(null)
    })
  }

  function handleDelete(id: string) {
    setDeleting(id)
    setError(null)
    startTransition(async () => {
      const result = await deleteCategoryAction(id)
      setDeleting(null)
      if (!result.ok) { setError(result.error); return }
      setCategories((prev) => prev.filter((c) => c._id !== id))
    })
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setAddError(null)
    if (!addForm.name.trim()) { setAddError('Name is required'); return }

    const fd = new FormData()
    fd.set('name', addForm.name.trim())
    fd.set('type', addForm.type)
    fd.set('color', addForm.color)

    startTransition(async () => {
      const result = await createCategoryAction(fd)
      if (!result.ok) { setAddError(result.error); return }
      setCategories((prev) => [
        ...prev,
        { _id: result.id, name: result.name, color: addForm.color, icon: 'tag', type: addForm.type, isSystem: false },
      ])
      setAddForm({ name: '', type: 'expense', color: '#1e40af' })
      setShowAdd(false)
    })
  }

  const inputClass = 'input-base'

  return (
    <div className="space-y-8">
      {/* ── Error banner ── */}
      {error && (
        <p className="rounded-lg bg-danger-bg border border-danger-ring/30 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}

      {/* ── User categories ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-ink">Your categories</h2>
            <p className="text-xs text-ink-muted mt-0.5">Custom categories you can edit or delete.</p>
          </div>
          <button
            type="button"
            onClick={() => { setShowAdd(true); setAddError(null) }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3.5 py-2 text-sm font-semibold text-white hover:bg-brand-h transition-colors focus-visible:ring-2 focus-visible:ring-brand-ring focus-visible:outline-none"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
            New category
          </button>
        </div>

        {/* Add form */}
        {showAdd && (
          <form
            onSubmit={handleAdd}
            className="card mb-4 p-4 space-y-4 border-brand/30 bg-brand-light/20"
          >
            <h3 className="text-sm font-semibold text-ink">New category</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label htmlFor="new-cat-name" className="block text-xs font-medium text-ink-muted mb-1">
                  Name <span className="text-danger" aria-hidden="true">*</span>
                </label>
                <input
                  ref={addNameRef}
                  id="new-cat-name"
                  type="text"
                  value={addForm.name}
                  onChange={(e) => setAddForm((p) => ({ ...p, name: e.target.value }))}
                  maxLength={40}
                  placeholder="e.g. Side hustle income"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="new-cat-type" className="block text-xs font-medium text-ink-muted mb-1">Type</label>
                <Select
                  id="new-cat-type"
                  value={addForm.type}
                  onChange={(e) => setAddForm((p) => ({ ...p, type: e.target.value as AddFormState['type'] }))}
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                  <option value="transfer">Transfer</option>
                </Select>
              </div>
            </div>

            {/* Color picker */}
            <div>
              <p className="text-xs font-medium text-ink-muted mb-2">Color</p>
              <div className="flex flex-wrap gap-2">
                {COLOR_PRESETS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-label={`Select color ${c}`}
                    onClick={() => setAddForm((p) => ({ ...p, color: c }))}
                    className="w-7 h-7 rounded-full ring-offset-2 ring-offset-surface transition-all"
                    style={{
                      background: c,
                      boxShadow: addForm.color === c ? `0 0 0 2px ${c}` : undefined,
                      outline: addForm.color === c ? '2px solid var(--c-ink)' : undefined,
                    }}
                  />
                ))}
              </div>
            </div>

            {addError && <p className="text-xs text-danger">{addError}</p>}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isPending}
                className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-h transition-colors disabled:opacity-50"
              >
                {isPending ? 'Saving…' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => { setShowAdd(false); setAddError(null) }}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-ink hover:bg-surface-r transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {userCategories.length === 0 && !showAdd ? (
          <div className="rounded-xl border border-dashed border-rule py-10 text-center">
            <p className="text-sm text-ink-muted">No custom categories yet.</p>
            <p className="mt-1 text-xs text-ink-faint">Create one above to personalize categorization.</p>
          </div>
        ) : (
          <div className="card divide-y divide-rule overflow-hidden">
            {userCategories.map((cat) => (
              <div key={cat._id} className="px-4 py-3">
                {editing?.id === cat._id ? (
                  /* Edit row */
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-ink-muted mb-1">Name</label>
                        <input
                          type="text"
                          value={editing.name}
                          onChange={(e) => setEditing((p) => p ? { ...p, name: e.target.value } : p)}
                          maxLength={40}
                          className={inputClass}
                          autoFocus
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-ink-muted mb-1">Type</label>
                        <Select
                          value={editing.type}
                          onChange={(e) => setEditing((p) => p ? { ...p, type: e.target.value as EditingState['type'] } : p)}
                        >
                          <option value="expense">Expense</option>
                          <option value="income">Income</option>
                          <option value="transfer">Transfer</option>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-ink-muted mb-2">Color</p>
                      <div className="flex flex-wrap gap-2">
                        {COLOR_PRESETS.map((c) => (
                          <button
                            key={c}
                            type="button"
                            aria-label={`Select color ${c}`}
                            onClick={() => setEditing((p) => p ? { ...p, color: c } : p)}
                            className="w-6 h-6 rounded-full transition-all"
                            style={{
                              background: c,
                              outline: editing.color === c ? `2px solid var(--c-ink)` : undefined,
                              outlineOffset: '2px',
                            }}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleSaveEdit}
                        disabled={isPending}
                        className="rounded-lg bg-brand px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-brand-h transition-colors disabled:opacity-50"
                      >
                        {isPending ? 'Saving…' : 'Save'}
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="rounded-lg border border-border px-3.5 py-1.5 text-xs font-medium text-ink hover:bg-surface-r transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Display row */
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ background: cat.color }}
                      aria-hidden="true"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink truncate">{cat.name}</p>
                      <p className="text-xs text-ink-muted capitalize">{cat.type}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => startEdit(cat)}
                        aria-label={`Edit ${cat.name}`}
                        className="rounded-md p-1.5 text-ink-faint hover:text-ink hover:bg-surface-r transition-colors focus-visible:ring-2 focus-visible:ring-brand-ring focus-visible:outline-none"
                      >
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                          <path
                            d="M11.333 2a1.886 1.886 0 0 1 2.667 2.667L5.333 13.333l-3.666.667.666-3.667L11.333 2Z"
                            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(cat._id)}
                        disabled={deleting === cat._id || isPending}
                        aria-label={`Delete ${cat.name}`}
                        className="rounded-md p-1.5 text-ink-faint hover:text-danger hover:bg-danger-bg transition-colors focus-visible:ring-2 focus-visible:ring-danger-ring focus-visible:outline-none disabled:opacity-40"
                      >
                        {deleting === cat._id ? (
                          <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4 31.4" strokeLinecap="round" />
                          </svg>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                            <path d="M2 4h12M5 4V2.5A.5.5 0 0 1 5.5 2h5a.5.5 0 0 1 .5.5V4M6 7v5M10 7v5M3 4l1 9a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── System categories ── */}
      <section>
        <div className="mb-4">
          <h2 className="text-base font-semibold text-ink">System categories</h2>
          <p className="text-xs text-ink-muted mt-0.5">Built-in categories shared across all users. Read-only.</p>
        </div>
        <div className="card divide-y divide-rule overflow-hidden">
          {systemCategories.map((cat) => (
            <div key={cat._id} className="flex items-center gap-3 px-4 py-3 opacity-80">
              <div className="w-3 h-3 rounded-full shrink-0" style={{ background: cat.color }} aria-hidden="true" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink truncate">{cat.name}</p>
                <p className="text-xs text-ink-muted capitalize">{cat.type}</p>
              </div>
              <span className="text-[10px] font-medium text-ink-faint border border-rule rounded px-1.5 py-0.5 uppercase tracking-wider">
                System
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
