# Under Construction Component - Usage Guide

## 🎯 Quick Start

The `PageWrapper` component makes it super easy to toggle between showing an "Under Construction" page and your actual working page.

---

## 📖 Basic Usage

### Method 1: Simple Toggle (Recommended)

```jsx
import React, { useState } from 'react';
import { PageWrapper } from '../../components/common';

const MyPage = () => {
  // Set to true = show under construction
  // Set to false = show actual page
  const [isUnderConstruction, setIsUnderConstruction] = useState(true);

  return (
    <PageWrapper
      isUnderConstruction={isUnderConstruction}
      constructionProps={{
        title: "My Page Title",
        subtitle: "This module is coming soon",
        icon: "construction", // or "tools", "rocket", "clock"
      }}
    >
      {/* YOUR ACTUAL PAGE CONTENT */}
      <div>Your working page goes here...</div>
    </PageWrapper>
  );
};

export default MyPage;
```

---

## 🎨 Advanced Usage with All Options

```jsx
import React, { useState } from 'react';
import { PageWrapper } from '../../components/common';

const VendorRelations = () => {
  const [isUnderConstruction, setIsUnderConstruction] = useState(true);

  return (
    <PageWrapper
      isUnderConstruction={isUnderConstruction}
      constructionProps={{
        title: "Vendor Relations",
        subtitle: "Manage your suppliers and purchase orders",
        icon: "tools", // Choose: construction, tools, rocket, clock
        estimatedCompletion: "January 2026",
        features: [
          "Vendor database management",
          "Purchase order tracking",
          "Supplier performance metrics",
          "Payment history & terms",
          "Contact management",
          "Document storage"
        ]
      }}
    >
      {/* Your actual working page */}
      <div className="min-h-screen bg-gray-50">
        <h1>Vendor Relations Page</h1>
        {/* ... rest of your page ... */}
      </div>
    </PageWrapper>
  );
};

export default VendorRelations;
```

---

## 🎭 Icon Options

Choose from 4 icon styles:

- **`construction`** - Yellow warning triangle (default)
- **`tools`** - Blue gear/settings icon
- **`rocket`** - Purple rocket/lightning icon  
- **`clock`** - Orange clock icon

---

## 📋 Example: Different Modules

### Example 1: Inventory Module

```jsx
const [isUnderConstruction] = useState(true);

return (
  <PageWrapper
    isUnderConstruction={isUnderConstruction}
    constructionProps={{
      title: "Inventory Management",
      subtitle: "Track your scaffolding equipment stock levels",
      icon: "tools",
      estimatedCompletion: "February 2026",
      features: [
        "Real-time stock tracking",
        "Low stock alerts",
        "Equipment condition monitoring",
        "Barcode scanning",
        "Transfer management"
      ]
    }}
  >
    <ActualInventoryPage />
  </PageWrapper>
);
```

### Example 2: Reports Module

```jsx
const [isUnderConstruction] = useState(true);

return (
  <PageWrapper
    isUnderConstruction={isUnderConstruction}
    constructionProps={{
      title: "Analytics & Reports",
      subtitle: "Business intelligence and reporting dashboard",
      icon: "rocket",
      estimatedCompletion: "March 2026",
      features: [
        "Revenue analytics",
        "Customer insights",
        "Equipment utilization",
        "Export to PDF/Excel",
        "Custom report builder"
      ]
    }}
  >
    <ActualReportsPage />
  </PageWrapper>
);
```

### Example 3: Minimal (No Features/Date)

```jsx
const [isUnderConstruction] = useState(true);

return (
  <PageWrapper
    isUnderConstruction={isUnderConstruction}
    constructionProps={{
      title: "Settings",
      subtitle: "Configure your system preferences",
      icon: "clock"
    }}
  >
    <ActualSettingsPage />
  </PageWrapper>
);
```

---

## 🔄 How to Switch from Construction to Live

**To hide from clients (show construction):**
```jsx
const [isUnderConstruction] = useState(true);
```

**To show working page:**
```jsx
const [isUnderConstruction] = useState(false);
```

**With toggle control (for testing):**
```jsx
const [isUnderConstruction, setIsUnderConstruction] = useState(true);

// Add this button somewhere in your dev environment:
<button onClick={() => setIsUnderConstruction(!isUnderConstruction)}>
  Toggle Construction
</button>
```

---

## 🎯 Props Reference

### PageWrapper Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isUnderConstruction` | `boolean` | `false` | Show construction page if `true` |
| `constructionProps` | `object` | `{}` | Configuration for construction page |
| `children` | `ReactNode` | - | Your actual page content |

### constructionProps Object

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | "Under Construction" | Page title |
| `subtitle` | `string` | "This module is currently being developed" | Description |
| `icon` | `string` | "construction" | Icon type (construction/tools/rocket/clock) |
| `estimatedCompletion` | `string` | `null` | Show completion date (e.g., "January 2026") |
| `features` | `array` | `[]` | List of planned features |

---

## ✅ Best Practices

1. **Keep it simple** - Just toggle the boolean to show/hide
2. **Add meaningful features** - Help clients understand what's coming
3. **Set realistic dates** - Only add `estimatedCompletion` if you're confident
4. **Choose appropriate icons** - Match the icon to the module type
5. **Use descriptive titles** - Make it clear what the module will do

---

## 🚀 Quick Implementation Checklist

- [ ] Import `PageWrapper` from common components
- [ ] Create `useState` with `true` for construction mode
- [ ] Wrap your page content with `<PageWrapper>`
- [ ] Configure `constructionProps` with title, subtitle, icon
- [ ] Add planned features list (optional)
- [ ] Add estimated completion date (optional)
- [ ] When ready to go live, change `useState(true)` to `useState(false)`

---

## 💡 Pro Tips

**For Development:**
```jsx
// Use environment variable to auto-toggle based on environment
const [isUnderConstruction] = useState(
  process.env.REACT_APP_ENV === 'production'
);
```

**For Feature Flags:**
```jsx
// Store construction state in a config file
import { FEATURE_FLAGS } from '../../config/features';

const [isUnderConstruction] = useState(
  FEATURE_FLAGS.VENDOR_RELATIONS_UNDER_CONSTRUCTION
);
```

**For Role-Based Access:**
```jsx
// Show to admins but hide from clients
const user = useSelector(state => state.auth.user);
const [isUnderConstruction] = useState(
  user.role !== 'super_admin'
);
```

---

## 🎨 Design Features

The Under Construction component includes:
- ✅ Animated bouncing icon
- ✅ Progress bar with pulse animation
- ✅ Gradient color scheme matching your design system
- ✅ Responsive design for mobile/tablet/desktop
- ✅ Dark mode support
- ✅ Professional messaging
- ✅ Feature list preview
- ✅ Estimated completion badge

