import { test } from 'node:test'
import assert from 'node:assert/strict'

import {
  achievementSchema,
  achievementUpdateSchema,
  documentSchema,
  documentUpdateSchema,
  educationSchema,
  educationUpdateSchema,
  experienceSchema,
  experienceUpdateSchema,
  navigationSchema,
  navigationUpdateSchema,
  profileSchema,
  resourceSchemas,
  socialSchema,
  socialUpdateSchema,
} from '../../shared/schemas/resources.ts'

/**
 * Every schema and update variant is exercised here because these modules are
 * evaluated when the server boots: a schema that throws at definition time
 * (for example `.partial()` on a refined object) takes the whole Nitro entry
 * down, and every route starts returning 500.
 */

const validExperience = {
  title: 'Senior Engineer',
  organization: 'Acme',
  start_date: '2024-01-01',
  is_current: true,
  is_visible: true,
}

test('every resource schema is constructible and has a usable update variant', () => {
  for (const [name, schemas] of Object.entries(resourceSchemas)) {
    assert.ok(schemas.insert, `${name} is missing an insert schema`)
    assert.ok(schemas.update, `${name} is missing an update schema`)
    // A partial must accept an empty payload.
    assert.equal(schemas.update.safeParse({}).success, true, `${name} update rejects {}`)
  }

  // Exercise the explicit partials too, since they are built separately.
  for (const schema of [
    experienceUpdateSchema,
    educationUpdateSchema,
    achievementUpdateSchema,
    socialUpdateSchema,
    documentUpdateSchema,
    navigationUpdateSchema,
  ]) {
    assert.equal(schema.safeParse({}).success, true)
  }
})

test('experience requires an end date unless the role is current', () => {
  assert.equal(experienceSchema.safeParse(validExperience).success, true)
  assert.equal(
    experienceSchema.safeParse({ ...validExperience, is_current: false, end_date: null }).success,
    false,
  )
  assert.equal(
    experienceSchema.safeParse({ ...validExperience, is_current: false, end_date: '2025-06-30' })
      .success,
    true,
  )
})

test('experience normalises empty optional values to null', () => {
  const parsed = experienceSchema.parse({
    ...validExperience,
    description: '',
    location: '   ',
    end_date: '',
    logo_url: '',
  })

  assert.equal(parsed.description, null)
  assert.equal(parsed.location, null)
  assert.equal(parsed.end_date, null)
  assert.equal(parsed.logo_url, null)
})

test('required fields and formats are enforced', () => {
  assert.equal(experienceSchema.safeParse({ ...validExperience, title: '   ' }).success, false)
  assert.equal(experienceSchema.safeParse({ ...validExperience, start_date: '01/01/2024' }).success, false)
  assert.equal(socialSchema.safeParse({ platform: 'GitHub', url: 'not-a-url', is_visible: true }).success, false)
  assert.equal(
    socialSchema.safeParse({ platform: 'GitHub', url: 'https://github.com/x', is_visible: true })
      .success,
    true,
  )
  assert.equal(educationSchema.safeParse({ institution: 'X', degree: 'Y', start_date: 'nope' }).success, false)
  assert.equal(achievementSchema.safeParse({ title: 'A', issuer: 'B', is_visible: true }).success, true)
  assert.equal(documentSchema.safeParse({ name: 'CV', file_path: 'a/b.pdf', is_active: true, is_visible: true }).success, true)
  assert.equal(navigationSchema.safeParse({ label: 'Home', path: '/', is_visible: true, is_external: false }).success, true)
})

test('the profile singleton validates an optional email', () => {
  const base = { name: 'Hafiz', is_visible: true }

  assert.equal(profileSchema.safeParse(base).success, true)
  assert.equal(profileSchema.safeParse({ ...base, email: '' }).success, true)
  assert.equal(profileSchema.safeParse({ ...base, email: null }).success, true)
  assert.equal(profileSchema.safeParse({ ...base, email: 'owner@example.com' }).success, true)
  assert.equal(profileSchema.safeParse({ ...base, email: 'not-an-email' }).success, false)
  assert.equal(profileSchema.safeParse({ ...base, name: '' }).success, false)
})
