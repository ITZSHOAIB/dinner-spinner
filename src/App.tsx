import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'motion/react'
import { Layout } from './components/layout/Layout'
import { HomePage } from './pages/HomePage'
import { BrowsePage } from './pages/BrowsePage'
import { FavoritesPage } from './pages/FavoritesPage'
import { PreferencesPage } from './pages/PreferencesPage'
import { RecipeDetail } from './components/recipe/RecipeDetail'
import { useRecipeStore } from './stores/recipeStore'
import { recipes } from './data/recipes'
import { normalizeTags } from './data/tagMigration'
import './lib/theme'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname])
  return null
}

export default function App() {
  const setRecipes = useRecipeStore((s) => s.setRecipes)

  useEffect(() => {
    // Normalize recipe tags through the controlled vocabulary before storing.
    const normalized = recipes.map((r) => ({ ...r, tags: normalizeTags(r.tags) }))
    setRecipes(normalized)
  }, [])

  return (
    <>
      <ScrollToTop />
      <AnimatePresence mode="wait">
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/recipes" element={<BrowsePage />} />
            <Route path="/recipes/:id" element={<RecipeDetail />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/history" element={<PreferencesPage />} />
            <Route path="/preferences" element={<PreferencesPage />} />
          </Route>
        </Routes>
      </AnimatePresence>
    </>
  )
}
