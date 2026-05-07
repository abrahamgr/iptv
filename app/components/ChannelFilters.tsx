import { useState } from 'react'
import { Form, useNavigation, useSubmit } from 'react-router'

interface ChannelFiltersProps {
  categories: string[]
  selectedCategories: string[]
  searchQuery: string
}

export function ChannelFilters({
  categories,
  selectedCategories,
  searchQuery,
}: ChannelFiltersProps) {
  const navigation = useNavigation()
  const submit = useSubmit()
  const isSearching =
    navigation.state === 'loading' && navigation.formMethod === 'GET'

  const [isCategoryOpen, setIsCategoryOpen] = useState(false)

  const hasActiveFilters =
    selectedCategories.length > 0 || searchQuery.length > 0
  const filterKey = `${searchQuery}-${selectedCategories.join(',')}`

  const handleClearFilters = () => {
    submit({}, { method: 'get' })
  }

  const handleCategoryChange = () => {
    // When checking/unchecking, we want to submit the form.
    // By using a timeout, we allow the DOM to update the checkbox state first.
    setTimeout(() => {
      const form = document.getElementById(
        'channel-filter-form',
      ) as HTMLFormElement
      if (form) submit(form)
    }, 0)
  }

  return (
    <div className="mb-8 space-y-4">
      <Form
        key={filterKey}
        method="get"
        id="channel-filter-form"
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="flex-1">
          <label
            htmlFor="search"
            className="block text-sm font-medium mb-2 text-gray-300"
          >
            Search Channels
          </label>
          <div className="relative">
            <input
              id="search"
              name="search"
              type="text"
              defaultValue={searchQuery}
              placeholder="Search by channel name..."
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
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
              <button
                type="button"
                aria-label="Close category menu"
                className="fixed inset-0 z-10 cursor-default"
                onClick={() => setIsCategoryOpen(false)}
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
                          name="category"
                          value={category}
                          defaultChecked={isSelected}
                          onChange={() => handleCategoryChange()}
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

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClearFilters}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Clear Filters
          </button>
        )}
      </Form>
    </div>
  )
}
