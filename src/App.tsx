import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'motion/react'
import { Layout } from './components/layout/Layout'
import { HomePage } from './pages/HomePage'
import { BrowsePage } from './pages/BrowsePage'
import { FavoritesPage } from './pages/FavoritesPage'
import { PreferencesPage } from './pages/PreferencesPage'
import { RecipeDetail } from './components/recipe/RecipeDetail'
import { useRecipeStore } from './stores/recipeStore'
import { recipes } from './data/recipes'
import './lib/theme'

export default function App() {
  const setRecipes = useRecipeStore((s) => s.setRecipes)

  useEffect(() => {
    setRecipes(recipes)
  }, [])

  return (
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
  )
}
