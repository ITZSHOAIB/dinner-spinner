// Share or copy an ingredients list. Prefers the native share sheet on
// mobile (WhatsApp, Messages, email, etc.), falls back to clipboard on
// desktop where `navigator.share` isn't available.

export interface ShareIngredientsArgs {
  recipeName: string
  servings: number
  ingredients: string[]  // already scaled, and already filtered to the subset the user wants to share
}

export type ShareResult = 'shared' | 'copied' | 'cancelled' | 'failed'

export function buildShareText({ recipeName, servings, ingredients }: ShareIngredientsArgs): string {
  const header = `${recipeName} — ${servings} serving${servings === 1 ? '' : 's'}`
  const body = ingredients.map((i) => `- ${i}`).join('\n')
  return `${header}\n\n${body}`
}

export function canNativeShare(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function'
}

export async function shareIngredients(args: ShareIngredientsArgs): Promise<ShareResult> {
  const text = buildShareText(args)

  if (canNativeShare()) {
    try {
      await navigator.share({ title: args.recipeName, text })
      return 'shared'
    } catch (err) {
      // User dismissed the share sheet — not an error, just a no-op.
      if (err instanceof Error && err.name === 'AbortError') return 'cancelled'
      // Any other share error (permissions, unsupported payload): fall through
      // and try the clipboard so the user still gets something.
    }
  }

  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return 'copied'
    } catch {
      return 'failed'
    }
  }

  return 'failed'
}
