## What this PR does

<!-- One sentence. E.g. "Adds the Bengali dish Kosha Mangsho." -->

## Type of change

- [ ] New recipe
- [ ] Bug fix
- [ ] Feature / enhancement
- [ ] Documentation
- [ ] Other: <!-- specify -->

## Recipe PRs — checklist

Skip this section for non-recipe PRs.

- [ ] `id` is unique across all recipe files
- [ ] `cuisine` is one of the allowed values ([CONTRIBUTING.md](../blob/main/CONTRIBUTING.md#valid-cuisine-values))
- [ ] `style` is valid for at least one of the `mealTypes`
- [ ] `proteinBase` is valid for at least one of the `mealTypes`
- [ ] Dietary flags are consistent (vegan ⇒ vegetarian + dairy-free, etc.)
- [ ] `tags` are from the [canonical list](../blob/main/CONTRIBUTING.md#canonical-tags) (2–5 tags)
- [ ] `totalTimeMinutes` ≈ `prepTimeMinutes + cookTimeMinutes`
- [ ] `keyIngredients` has 3–5 headline items
- [ ] `yarn validate-recipes` passes locally
- [ ] `yarn build` succeeds

## Screenshot (UI changes only)

<!-- Drag an image here or delete this section. -->

## Additional context

<!-- Links, references, credit to the original recipe source, anything else. -->
