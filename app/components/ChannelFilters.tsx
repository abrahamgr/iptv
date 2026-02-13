import { useEffect, useRef, useState } from 'react'

interface ChannelFiltersProps {
  categories: string[]
  selectedCategories: string[]
  searchQuery: string
  onCategoryChange: (categories: string[]) => void
  onSearchChange: (query: string) => void
  onClearFilters: () => void
}

export function ChannelFilters({
  categories,
  selectedCategories,
  searchQuery,
  onSearchChange,
  onCategoryChange,
  onClearFilters,
}: ChannelFiltersProps) {
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)
  const [inputValue, setInputValue] = useState(searchQuery)
  const isFirstRender = useRef(true)
  const onSearchChangeRef = useRef(onSearchChange)
  onSearchChangeRef.current = onSearchChange

  useEffect(() => {
    setInputValue(searchQuery)
  }, [searchQuery])

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    const timer = setTimeout(() => {
      onSearchChangeRef.current(inputValue)
    }, 300)
    return () => clearTimeout(timer)
  }, [inputValue])

  const hasActiveFilters =
    selectedCategories.length > 0 || searchQuery.length > 0

  const handleCategoryToggle = (category: string) => {
    if (selectedCategories.includes(category)) {
      onCategoryChange(selectedCategories.filter((c) => c !== category))
    } else {
      onCategoryChange([...selectedCategories, category])
    }
  }

  return (
    <div className="mb-8 space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label
            htmlFor="search"
            className="block text-sm font-medium mb-2 text-gray-300"
          >
            Search Channels
          </label>
          <input
            id="search"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Search by channel name..."
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex-1 relative">
          <label className="block text-sm font-medium mb-2 text-gray-300">
            Filter by Category
          </label>
          <button
            type="button"
            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between"
          >
            <span>
              {selectedCategories.length > 0
                ? `${selectedCategories.length} category${selectedCategories.length > 1 ? 'ies' : 'y'} selected`
                : 'Select categories...'}
            </span>
            <svg
              className={`w-5 h-5 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {isCategoryOpen && (
            <>
              <div
                role="presentation"
                className="fixed inset-0 z-10"
                onClick={() => setIsCategoryOpen(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setIsCategoryOpen(false)
                }}
              />
              <div className="absolute z-20 w-full mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                <div className="p-2 space-y-1">
                  {categories.map((category) => {
                    const isSelected = selectedCategories.includes(category)
                    return (
                      <label
                        key={category}
                        className="flex items-center px-3 py-2 hover:bg-gray-700 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleCategoryToggle(category)}
                          className="mr-3 w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-white">{category}</span>
                      </label>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Clear Filters
        </button>
      )}
    </div>
  )
}
