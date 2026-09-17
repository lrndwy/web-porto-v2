import type { Tables, TablesInsert, TablesUpdate } from './database.types'

// `Database`, `Tables`, `TablesInsert`, and `TablesUpdate` live in
// ./database.types.ts and are auto-imported from `shared/types/`, so they are
// deliberately not re-exported here (that would be a duplicate declaration).

/** Row aliases, so call sites never index into the generated Database type. */
export type UserProfileRow = Tables<'user_profiles'>
export type ProfileRow = Tables<'profiles'>
export type ExperienceRow = Tables<'experiences'>
export type AchievementRow = Tables<'achievements'>
export type EducationRow = Tables<'educations'>
export type SocialRow = Tables<'socials'>
export type DocumentRow = Tables<'documents'>

export type BlogCategoryRow = Tables<'blog_categories'>
export type BlogTagRow = Tables<'blog_tags'>
export type BlogPostRow = Tables<'blog_posts'>
export type BlogPostTagRow = Tables<'blog_post_tags'>

export type GithubSettingsRow = Tables<'github_settings'>
export type GithubRepositoryRow = Tables<'github_repositories'>

export type AiRouterSettingsRow = Tables<'ai_router_settings'>
export type AiProviderRow = Tables<'ai_providers'>
export type AiModelRow = Tables<'ai_models'>
export type AiApiKeyRow = Tables<'ai_api_keys'>
export type AiUsageLogRow = Tables<'ai_usage_logs'>
export type AiRateLimitRow = Tables<'ai_rate_limits'>

export type AnalyticsVisitorRow = Tables<'analytics_visitors'>
export type AnalyticsSessionRow = Tables<'analytics_sessions'>
export type AnalyticsPageviewRow = Tables<'analytics_pageviews'>
export type AnalyticsEventRow = Tables<'analytics_events'>

export type SiteSettingsRow = Tables<'site_settings'>
export type NavigationItemRow = Tables<'navigation_items'>

/** Insert aliases for the shapes server handlers actually write. */
export type ProfileInsert = TablesInsert<'profiles'>
export type ExperienceInsert = TablesInsert<'experiences'>
export type BlogPostInsert = TablesInsert<'blog_posts'>
export type GithubRepositoryInsert = TablesInsert<'github_repositories'>
export type AiUsageLogInsert = TablesInsert<'ai_usage_logs'>
export type AnalyticsVisitorInsert = TablesInsert<'analytics_visitors'>

export type ProfileUpdate = TablesUpdate<'profiles'>
export type BlogPostUpdate = TablesUpdate<'blog_posts'>
export type GithubRepositoryUpdate = TablesUpdate<'github_repositories'>
export type NavigationItemUpdate = TablesUpdate<'navigation_items'>
