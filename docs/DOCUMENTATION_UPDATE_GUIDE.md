# Documentation Update Guide for AI Assistants

## 🚨 IMPORTANT: Documentation Must Be Updated

This guide ensures that all AI assistants update project documentation after making changes to the codebase. Keeping documentation current is CRITICAL for future AI sessions.

## When to Update Documentation

### Always Update After:
1. **Structural Changes**
   - Adding/removing files or directories
   - Moving files between directories
   - Creating new components or services

2. **Feature Changes**
   - Adding new features
   - Removing features
   - Modifying business logic

3. **Database Changes**
   - Schema modifications
   - New collections
   - Field additions/removals

4. **API Changes**
   - New endpoints
   - Modified routes
   - Changed parameters

5. **Configuration Changes**
   - Environment variables
   - Build processes
   - Deployment configurations

## Documentation Update Checklist

### For Every Change Session:

#### 1. Update docs/RECENT_CHANGES.md
```markdown
### [Feature/Change Name]
**Date**: [Current Date]
**Impact**: [High/Medium/Low]
**Files Modified**:
- [List all modified files]

**Changes Made**:
- [Bullet points of specific changes]

**Migration Notes**:
- [Any special considerations]
```

#### 2. Update docs/PROJECT_DOCUMENTATION.md
- [ ] Update architecture section if structure changed
- [ ] Update technology stack if dependencies changed
- [ ] Update business logic if rules changed
- [ ] Update database structure if schema changed
- [ ] Update deployment section if process changed
- [ ] Update "Known Issues" if new issues discovered
- [ ] Update "Last Updated" date at bottom

#### 3. Update docs/CODEBASE_STRUCTURE.md
- [ ] Add new files/directories to structure
- [ ] Remove deleted files/directories
- [ ] Update file descriptions if purpose changed
- [ ] Update component relationships
- [ ] Update "Last Updated" date

#### 4. Update CLAUDE.md
- [ ] Update "Current Status" section with date
- [ ] Add new common tasks if applicable
- [ ] Update key file locations if moved
- [ ] Update business rules if changed
- [ ] Add new patterns or solutions
- [ ] Update "Recent Changes to Remember"
- [ ] Update "Last Updated" date

## Documentation Update Template

### For docs/RECENT_CHANGES.md Entry:
```markdown
### [Your Change Title]
**Date**: [Month Year]  
**Impact**: [High/Medium/Low]  
**Files Modified**:
- `/path/to/file1.ts` (what changed)
- `/path/to/file2.tsx` (what changed)

**Changes Made**:
- [Specific change 1]
- [Specific change 2]
- [Include code snippets if helpful]

**Migration Notes**:
- [What needs attention in future]
- [Any temporary solutions]
- [Breaking changes]

**Testing Notes**:
- [What was tested]
- [What needs testing]
```

## Quick Update Commands for AI

### At the End of Every Session:
```markdown
1. "I need to update the project documentation now"
2. "Let me update docs/RECENT_CHANGES.md with today's modifications"
3. "I'll update the documentation files to reflect these changes"
```

### Documentation Update Workflow:
```bash
# 1. Read current documentation
Read: docs/RECENT_CHANGES.md
Read: docs/PROJECT_DOCUMENTATION.md (relevant sections)
Read: docs/CODEBASE_STRUCTURE.md (if structure changed)
Read: CLAUDE.md

# 2. Update with new changes
Edit/Write: [Update each relevant file]

# 3. Verify updates
- Check all dates are current
- Ensure changes are accurately described
- Verify file paths are correct
```

## Examples of Good Documentation Updates

### Example 1: Feature Addition
```markdown
### Added Email Notification System
**Date**: February 2025  
**Impact**: Medium  
**Files Modified**:
- `/lib/email-service.ts` (new file)
- `/app/api/send-email/route.ts` (new endpoint)
- `/contexts/auth-context.tsx` (added email trigger)

**Changes Made**:
- Created new email service using SendGrid
- Added email notification on successful signup
- Added email templates for welcome messages

**Migration Notes**:
- Requires SENDGRID_API_KEY in environment
- Email templates stored in `/templates/email/`
```

### Example 2: Breaking Change
```markdown
### Migrated from Pages to App Router
**Date**: March 2025  
**Impact**: High  
**Files Modified**:
- Entire `/pages` directory removed
- New `/app` directory structure created
- All components updated for RSC

**Changes Made**:
- [Detailed migration steps]

**Migration Notes**:
- All routes now use App Router conventions
- Client components marked with 'use client'
- API routes moved to `/app/api/`
```

## Documentation Quality Checklist

### Before Completing Session:
- [ ] Is docs/RECENT_CHANGES.md updated with today's work?
- [ ] Are all modified files listed?
- [ ] Are changes described clearly for future AI?
- [ ] Are migration/breaking changes noted?
- [ ] Are temporary solutions marked with "TEMPORARY"?
- [ ] Are all documentation dates updated?
- [ ] Would a new AI understand what changed?

## Special Markers to Use

### In Code:
```typescript
// TEMPORARY: Increased quota to 50 for promotion (revert to 5)
// TODO: Update this when payment gateway is added
// DEPRECATED: Remove in next major version
// BREAKING: This will affect existing users
```

### In Documentation:
- **🚨 BREAKING**: For breaking changes
- **⚠️ WARNING**: For important notes
- **📝 TODO**: For future tasks
- **🔄 TEMPORARY**: For temporary solutions
- **✅ RESOLVED**: For fixed issues

## Remember

1. **Documentation is NOT optional** - It's part of the task
2. **Be specific** - Future AI needs clear context
3. **Include dates** - Helps track when changes occurred
4. **List all files** - Even minor changes
5. **Explain why** - Not just what changed

## Auto-Update Reminder for AI

Add this to your task list at the start of each session:
```
- [ ] Update docs/RECENT_CHANGES.md before ending session
- [ ] Update other docs if structure/features changed
- [ ] Verify all documentation dates are current
```

---

**Purpose**: Ensure all AI assistants maintain up-to-date documentation
**Created**: January 2025
**Enforcement**: REQUIRED for all code changes