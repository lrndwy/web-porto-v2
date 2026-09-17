/**
 * Field and blank-value definitions for the generated admin forms. Kept out of
 * the page files so the "new" and "edit" pages for a resource cannot drift.
 */

export const experienceFields: FieldDef[] = [
  { name: 'title', label: 'Role title', type: 'text', placeholder: 'Senior Engineer' },
  { name: 'organization', label: 'Organisation', type: 'text', placeholder: 'Acme' },
  { name: 'location', label: 'Location', type: 'text', placeholder: 'Jakarta, Indonesia' },
  { name: 'start_date', label: 'Start date', type: 'date' },
  { name: 'is_current', label: 'Current role', type: 'switch', description: 'Leaves the end date open.' },
  { name: 'end_date', label: 'End date', type: 'date', description: 'Ignored while the role is current.' },
  { name: 'description', label: 'Description', type: 'textarea', rows: 6 },
  { name: 'logo_url', label: 'Logo', type: 'image', bucket: 'site-assets' },
  { name: 'is_visible', label: 'Visible', type: 'switch', description: 'Hidden rows stay in the dashboard only.' },
]

export const experienceBlank = {
  title: '',
  organization: '',
  location: '',
  start_date: '',
  is_current: false,
  end_date: '',
  description: '',
  logo_url: '',
  is_visible: true,
}

export const achievementFields: FieldDef[] = [
  { name: 'title', label: 'Achievement', type: 'text' },
  { name: 'issuer', label: 'Issuer', type: 'text' },
  { name: 'achievement_date', label: 'Date', type: 'date' },
  { name: 'certificate_url', label: 'Certificate URL', type: 'url', placeholder: 'https://…' },
  { name: 'image_url', label: 'Image', type: 'image', bucket: 'achievement-images' },
  { name: 'description', label: 'Description', type: 'textarea', rows: 5 },
  { name: 'is_visible', label: 'Visible', type: 'switch' },
]

export const achievementBlank = {
  title: '',
  issuer: '',
  achievement_date: '',
  certificate_url: '',
  image_url: '',
  description: '',
  is_visible: true,
}

export const educationFields: FieldDef[] = [
  { name: 'institution', label: 'Institution', type: 'text' },
  { name: 'degree', label: 'Degree', type: 'text' },
  { name: 'field', label: 'Field of study', type: 'text' },
  { name: 'start_date', label: 'Start date', type: 'date' },
  { name: 'end_date', label: 'End date', type: 'date' },
  { name: 'description', label: 'Description', type: 'textarea', rows: 5 },
  { name: 'logo_url', label: 'Logo', type: 'image', bucket: 'site-assets' },
  { name: 'is_visible', label: 'Visible', type: 'switch' },
]

export const educationBlank = {
  institution: '',
  degree: '',
  field: '',
  start_date: '',
  end_date: '',
  description: '',
  logo_url: '',
  is_visible: true,
}

export const documentFields: FieldDef[] = [
  { name: 'name', label: 'Document name', type: 'text', placeholder: 'Curriculum Vitae' },
  { name: 'version', label: 'Version', type: 'text', placeholder: '2026' },
  { name: 'file_path', label: 'File', type: 'file', bucket: 'documents', wide: true },
  {
    name: 'is_active',
    label: 'Active',
    type: 'switch',
    description: 'Inactive documents are never offered for download.',
  },
  { name: 'is_visible', label: 'Visible', type: 'switch' },
]

export const documentBlank = {
  name: '',
  version: '',
  file_path: '',
  file_type: '',
  file_size: null,
  is_active: true,
  is_visible: true,
}

export const socialFields: FieldDef[] = [
  { name: 'platform', label: 'Platform', type: 'text', placeholder: 'GitHub' },
  { name: 'username', label: 'Username', type: 'text' },
  { name: 'url', label: 'URL', type: 'url', placeholder: 'https://github.com/you', wide: true },
  { name: 'icon', label: 'Icon', type: 'text', placeholder: 'ph:github-logo' },
  { name: 'is_visible', label: 'Visible', type: 'switch' },
]

export const socialBlank = {
  platform: '',
  username: '',
  url: '',
  icon: '',
  is_visible: true,
}
