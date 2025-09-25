# Localization Guide

This directory contains all translation files for the Custom Aluminium application.

## Current Languages

- **English (en)**: `en.json` - Default language

## File Structure

```
src/utils/locales/
├── en.json           # English translations
├── index.ts          # Locale exports and configuration
└── README.md         # This guide
```

## Adding a New Language

To add a new language (e.g., French):

### 1. Create the translation file
Create `fr.json` with the same structure as `en.json`:

```json
{
  "login": {
    "title": "Bon Retour",
    "subtitle": "Connectez-vous à Custom Aluminium",
    "email": "Adresse E-mail",
    "password": "Mot de Passe",
    "signInButton": "Se Connecter",
    "forgotPassword": "Mot de passe oublié?",
    "noAccount": "Vous n'avez pas de compte?",
    "contactAdmin": "Contacter l'Admin",
    "loading": "Connexion...",
    "loaderMessage": "Connexion à Custom Aluminium...",
    "or": "ou"
  },
  "common": {
    "loading": "Chargement...",
    "error": "Erreur",
    "success": "Succès",
    "cancel": "Annuler",
    "save": "Enregistrer",
    "delete": "Supprimer",
    "edit": "Modifier",
    "create": "Créer",
    "update": "Mettre à jour",
    "search": "Rechercher",
    "filter": "Filtrer",
    "close": "Fermer",
    "confirm": "Confirmer"
  },
  "errors": {
    "required": "Ce champ est requis",
    "invalidEmail": "Veuillez entrer une adresse e-mail valide",
    "loginFailed": "Échec de la connexion. Vérifiez vos identifiants.",
    "networkError": "Erreur réseau. Veuillez réessayer.",
    "unknownError": "Une erreur inconnue s'est produite."
  }
}
```

### 2. Update index.ts
Add the new language to the exports:

```typescript
import en from './en.json';
import fr from './fr.json';

export const locales = {
  en,
  fr,
};

export const availableLanguages = ['en', 'fr'] as const;
```

### 3. Update I18nProvider (if needed)
The I18nProvider will automatically pick up new languages. If you want to change the default language, update `defaultLanguage` in `index.ts`.

## Translation Key Structure

All translation keys follow a hierarchical structure:

- `login.*` - Login page specific translations
- `common.*` - Common UI elements (buttons, labels, etc.)
- `errors.*` - Error messages

## Usage in Components

```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('login.title')}</h1>
      <p>{t('common.loading')}</p>
    </div>
  );
}
```

## Best Practices

1. **Keep keys consistent** across all language files
2. **Use descriptive key names** that indicate content purpose
3. **Group related translations** under common prefixes
4. **Test all languages** before deploying
5. **Use interpolation** for dynamic content: `t('welcome', { name: 'John' })`

## Dynamic Language Switching (Future)

To add language switching functionality:

1. Create a language selector component
2. Use `i18n.changeLanguage(language)` to switch
3. Store language preference in localStorage
4. Update initial language detection in I18nProvider 