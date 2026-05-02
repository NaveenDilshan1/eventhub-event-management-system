# Events Background Image Enhancements

## Summary
Added background image styling across all event pages to create visually appealing presentations with hero sections and image overlays.

## Changes Made

### 1. **Admin Event View Page** (`src/pages/dashboards/admin/EventViewPage.tsx`)
- Added hero section with full-width background image
- Implemented dark gradient overlay (black 40%-60% opacity)
- Event title and location displayed over image with white text
- Card lifted above hero with -mt-12 negative margin effect
- Hover effects on gallery images

### 2. **User Event Details Page** (`src/pages/dashboards/user/UserEventDetailsPage.tsx`)
- Added hero section with responsive background image
- Dark gradient overlay (30%-50% opacity) for better text readability
- Event category displayed in white text
- Full-height hero implementation with proper spacing
- Back button integrated into hero section

### 3. **Manager My Events Page** (`src/pages/dashboards/manager/MyEventsPage.tsx`)
- Event cards now use background images instead of img tags
- Gradient overlay on hover for enhanced interactivity
- Event title displayed as white text over image
- Smooth gradient transition: `from-black/60 to-transparent`
- Hover effect: `group-hover:from-black/70` for darker overlay

### 4. **Browse Events Page** (`src/pages/dashboards/user/BrowseEventsPage.tsx`)
- Background image styling on event cards
- Gradient overlay with hover effect
- Category and price badges positioned over image with z-10
- Smooth hover transitions and scaling effects

### 5. **User Dashboard** (`src/pages/dashboards/user/UserDashboard.tsx`)
- Upcoming events thumbnails now use background images
- Recommended events cards enhanced with background images
- Gradient overlay on hover for recommended events
- Improved visual consistency across dashboard

## Visual Features Added

### Hero Sections
- Full-width background images with dark gradient overlays
- Better readability with 40-70% opacity black overlays
- White text for maximum contrast
- Responsive heights (h-96 on desktop)

### Event Cards
- Background images instead of img elements
- Gradient overlays: `from-black/60 to-transparent`
- Hover state gradients: `from-black/70` for deeper effect
- Smooth transitions using Tailwind's transition utilities
- Proper z-index management for badges and overlays

### Color Schemes
- **Hero Sections**: Dark overlays (rgba(0,0,0,0.4) to 0.6))
- **Cards**: Medium overlays (rgba(0,0,0,0.6))
- **Hover States**: Darker overlays (rgba(0,0,0,0.7))

## CSS Classes Used

```css
/* Hero Section */
.bg-cover
.bg-center
.group-hover:from-black/70
.transition

/* Card Overlays */
.absolute.inset-0
.bg-gradient-to-t
.from-black/60.to-transparent

/* Text Styling */
.text-white
.text-gray-200
.line-clamp-2
```

## Implementation Details

### Background Image Styling Pattern
```tsx
<div
  className="relative h-40 bg-cover bg-center flex items-end group"
  style={{
    backgroundImage: `url('${imageUrl}')`
  }}
>
  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent group-hover:from-black/70 transition"></div>
</div>
```

### Hero Section Pattern
```tsx
<div
  className="relative h-96 bg-cover bg-center flex items-end"
  style={{
    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url('${imageUrl}')`
  }}
>
  {/* Content */}
</div>
```

## Benefits
✅ Professional appearance with background images
✅ Better visual hierarchy
✅ Improved user engagement with hover effects
✅ Responsive design on all screen sizes
✅ Better image loading performance (CSS backgrounds vs img tags)
✅ Consistent visual language across all event pages
✅ Enhanced accessibility with proper overlays for text readability

## Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- CSS Grid and Flexbox support required
- Background-size: cover support required
- CSS Gradients support required

## Notes
- All images maintain proper aspect ratios
- Fallback images used when imageUrl is not available
- Gradient overlays ensure text readability
- Hover effects provide interactive feedback to users
