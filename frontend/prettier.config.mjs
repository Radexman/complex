// Local re-export of the shared Sanity config so Prettier resolves it from
// frontend's own node_modules. Without this, `sanity typegen` (run during the
// Vercel build, which installs only the frontend workspace) walks up to the
// root package.json's "prettier": "@sanity/prettier-config" and fails to
// resolve the package, emitting a formatting warning during type generation.
export {default} from '@sanity/prettier-config'
