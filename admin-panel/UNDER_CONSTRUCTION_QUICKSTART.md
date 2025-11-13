# 🚧 Under Construction Component - Quick Start

## ⚡ 30-Second Setup

### Step 1: Import
```jsx
import { PageWrapper } from '../../components/common';
```

### Step 2: Add State
```jsx
const [isUnderConstruction] = useState(true);
```

### Step 3: Wrap Your Page
```jsx
return (
  <PageWrapper
    isUnderConstruction={isUnderConstruction}
    constructionProps={{
      title: "Your Page Name",
      subtitle: "This module is currently under development and will be available soon."
    }}
  >
    {/* Your actual page code */}
  </PageWrapper>
);
```

**That's it! 🎉**

**Shows:** Clean construction page with just title, subtitle, and simple message.  
**Hides:** All your working page content.

---

## 🎯 Real Example

```jsx
import React, { useState } from 'react';
import { PageWrapper } from '../../components/common';

const VendorRelations = () => {
  const [isUnderConstruction] = useState(true); // Show construction page
  
  return (
    <PageWrapper
      isUnderConstruction={isUnderConstruction}
      constructionProps={{
        title: "Vendor Relations",
        subtitle: "This module is currently under development and will be available soon."
      }}
    >
      {/* Your working page */}
      <div>Vendor page content...</div>
    </PageWrapper>
  );
};

export default VendorRelations;
```

---

## 🔄 To Show Your Working Page

Change this line:
```jsx
const [isUnderConstruction] = useState(true);  // 🚧 Construction
```

To this:
```jsx
const [isUnderConstruction] = useState(false); // ✅ Live
```

---

## 📦 Files Created

1. ✅ `admin-panel/src/components/common/UnderConstruction.jsx` - Main component
2. ✅ `admin-panel/src/components/common/PageWrapper.jsx` - Easy wrapper
3. ✅ `admin-panel/src/components/common/index.js` - Exports
4. ✅ `admin-panel/src/config/underConstruction.js` - Centralized config
5. ✅ `admin-panel/src/pages/vendorRelations/VendorRelations.jsx` - Example 1
6. ✅ `admin-panel/src/pages/salesOrders/SalesOrders.jsx` - Example 2

---

## 🎨 Customization Options

### Just Title (Minimal)
```jsx
constructionProps={{
  title: "My Page Name"
}}
```

### With Custom Message (Recommended)
```jsx
constructionProps={{
  title: "My Page Name",
  subtitle: "This module is currently under development and will be available soon."
}}
```

---

## 🎨 What Your Client Sees

- 🎨 Clean construction icon (science flask)
- 📝 Your custom title
- 💬 Your custom subtitle message
- 💙 Simple blue info box with professional message
- ✨ Gradient top border
- 🌓 Dark mode support

---

## 💡 Pro Tip: Centralized Control

Use the config file for easier management:

```jsx
import UNDER_CONSTRUCTION from '../../config/underConstruction';

const VendorRelations = () => {
  const [isUnderConstruction] = useState(UNDER_CONSTRUCTION.VENDOR_RELATIONS);
  // ...
};
```

Now you can control all pages from one file: `admin-panel/src/config/underConstruction.js`

---

## ✅ Quick Checklist

- [ ] Import `PageWrapper`
- [ ] Add `useState(true)` 
- [ ] Wrap your page content
- [ ] Add title in `constructionProps`
- [ ] Test that it shows construction page
- [ ] When ready: change `true` to `false`

**Done!** 🎉

---

## 🚀 Next Steps

1. **Copy one of the example files** (`VendorRelations.jsx` or `SalesOrders.jsx`)
2. **Rename it** to your page name
3. **Update the title** and subtitle
4. **Add your page content** inside the `<PageWrapper>`
5. **Import in your routes**

The component handles all the styling and animations automatically! 🎨

