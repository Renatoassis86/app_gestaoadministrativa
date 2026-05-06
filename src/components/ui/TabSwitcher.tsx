'use client'

import { useState, useEffect } from 'react'

interface Tab { id: string; label: string; count?: number }

interface TabSwitcherProps {
  tabs: Tab[]
  defaultTab?: string
  urlParamName?: string
  children: (activeTab: string) => React.ReactNode
}

export function TabSwitcher({ tabs, defaultTab, urlParamName = 'tab', children }: TabSwitcherProps) {
  const [active, setActive] = useState(() => {
    if (typeof window !== 'undefined' && urlParamName) {
      return new URLSearchParams(window.location.search).get(urlParamName) ?? defaultTab ?? tabs[0]?.id
    }
    return defaultTab ?? tabs[0]?.id
  })

  useEffect(() => {
    if (typeof window !== 'undefined' && urlParamName) {
      const p = new URLSearchParams(window.location.search).get(urlParamName)
      if (p && tabs.find(t => t.id === p)) setActive(p)
    }
  }, [])

  return (
    <div>
      {/* Tab bar */}
      <div style={{ display: 'flex', borderBottom: '2px solid var(--border)', marginBottom: '1.5rem', gap: 0, overflowX: 'auto' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            style={{
              padding: '.65rem 1.1rem',
              fontSize: '.82rem', fontWeight: active === tab.id ? 700 : 500,
              color: active === tab.id ? '#d97706' : 'var(--text-s)',
              background: 'none', border: 'none', cursor: 'pointer',
              borderBottom: `2px solid ${active === tab.id ? '#d97706' : 'transparent'}`,
              marginBottom: -2,
              transition: 'all .15s',
              whiteSpace: 'nowrap',
              fontFamily: 'var(--font-montserrat,sans-serif)',
              display: 'flex', alignItems: 'center', gap: '.35rem',
            }}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span style={{
                fontSize: '.65rem', fontWeight: 700,
                background: active === tab.id ? '#fef3c7' : 'var(--surface-2)',
                color: active === tab.id ? '#92400e' : 'var(--text-s)',
                padding: '.1rem .4rem', borderRadius: 99,
              }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {children(active)}
    </div>
  )
}
