# Mimi Pizza Pos

# Build a Professional Restaurant POS Demo for Mimi’s Pizza

## 1. Project Objective

Build a polished, functional, frontend-only Point of Sale (POS) web application for **Mimi’s Pizza**, a local restaurant in Pakistan.

This is a client presentation demo, not a normal restaurant website.

The restaurant owner will use the application on a tablet placed at the counter to take customer orders, select food items, calculate the bill automatically, review the order and print a receipt.

The demo must look and feel like professional restaurant billing software while remaining simple, fast and easy to operate.

**Important: This is a frontend-only prototype. Do not build a backend, database, authentication system or admin dashboard.**

## 2. Technical Requirements

- Use the existing Lovable project setup and its current compatible framework.
- Use React, TypeScript and Tailwind CSS.
- Use reusable components and clean, maintainable code.
- Keep the application to a single main POS screen.
- Store sample product information in a centralized static TypeScript data file, such as `src/data/menuData.ts`.
- Use React state for cart management, product selection, quantities, order type and receipt preview.
- Do not install unnecessary dependencies.
- Do not connect Supabase, external APIs, payment gateways or any backend services.
- Do not implement login, signup, database storage, an admin dashboard or persistent order history.
- No real customer data is required.
- All visible interactive controls must work within the frontend.

The application should run immediately in the Lovable preview without requiring environment variables, API keys or external setup.

## 3. Design Direction and Branding

Create a premium, modern restaurant POS interface inspired by Mimi’s Pizza's existing menu.

### Brand identity

Use the text **Mimi’s Pizza** as the temporary brand identity.

The client’s original logo will be supplied later. Do not create a new logo or invent an alternative brand identity.

A small, tasteful pizza icon may be used beside the text name if it is available through the existing icon library.

### Colour palette

Use a consistent palette inspired by the restaurant's existing menu:

- Primary orange: `#F58220`
- Warm yellow accent: `#FFD43B`
- Dark charcoal: `#242424`
- Warm white: `#FFFDF8`
- Subtle neutral grey for borders and secondary text.

Use orange for the primary actions, active category, selection states and important price highlights.

Use dark text on light backgrounds for readability.

### Visual style

- Professional, clean and functional restaurant software.
- Modern sans-serif typography.
- Compact but comfortable spacing.
- Clear visual hierarchy.
- Well-designed product cards and cart rows.
- Subtle shadows and rounded corners.
- Clear quantity buttons and primary action buttons.
- Consistent icons and component styling.
- Avoid excessive gradients, heavy glassmorphism, decorative animations and generic SaaS dashboard styling.
- Do not make the interface look like a conventional restaurant marketing website.

Prioritize usability and a strong first impression.

## 4. Tablet-First Responsive Layout

**The main priority is a tablet-friendly landscape layout, with excellent mobile responsiveness as well.**

Design the primary experience for a tablet used at a restaurant counter, approximately 10 inches in landscape orientation.

### Tablet and desktop layout

Use a compact top header and a two-panel workspace.

**Left/main panel: approximately 65–70% of the available width**

This section should contain:

- Product search.
- Menu category navigation.
- Product grid.
- Product prices.
- Product selection and size options.

**Right panel: approximately 30–35% of the available width**

This section should contain:

- Current order number.
- Dine-in/Takeaway selector.
- Optional table number for dine-in orders.
- Cart items.
- Quantity controls.
- Remove-item controls.
- Subtotal and total.
- Clear Cart, New Order and Print Bill actions.

Keep the cart visible beside the product area on landscape tablet and desktop screens, without unnecessary page scrolling.

Do not compress the content to the point that product names, prices or buttons become difficult to read.

For portrait tablets and narrower viewports, adapt the layout intelligently while preserving easy access to the current order.

### Mobile layout

The interface must also look excellent on a mobile phone.

- Use a compact header.
- Place the search field near the top.
- Display horizontally scrollable category tabs.
- Show products in a compact two-column grid.
- Use touch-friendly product cards and buttons.
- Add a fixed bottom bar displaying the current order item count, total and a “View Order” button.
- Open the cart in a full-screen panel or bottom sheet when View Order is pressed.
- Include quantity controls, remove actions and Print Bill in the mobile cart.
- Keep important actions visible and prevent horizontal overflow.
- Ensure buttons do not overlap the product content or browser controls.

The mobile layout should feel like a practical POS application, not a scaled-down desktop dashboard.

## 5. Main Application Header

Create a compact header containing:

- Text brand: Mimi’s Pizza.
- A small “POS DEMO” indicator.
- A “New Order” action.
- A clean, unobtrusive visual style.

The header should not consume excessive vertical space, especially on mobile.

Do not add unnecessary navigation pages or marketing sections.

## 6. Menu Categories

Create four functional product categories:

1. Deals
2. Pizza
3. Burgers
4. Drinks

Add an “All” option if useful.

The selected category must be visually highlighted.

When the user selects a category, update the visible products without reloading the page.

Include a search bar with a clear placeholder such as “Search products...”.

Search must work by product name and should filter the visible product list as the user types.

Show a useful empty state when no products match the search.

## 7. Sample Products and Menu Data

Use sample products based on Mimi’s Pizza's supplied menu. Keep all product names, descriptions, prices, sizes and deal details centralized in the static menu data file so they can be edited easily later.

Use Pakistani Rupees throughout the application and format prices clearly, for example, `Rs. 1,460`.

### A. Deals

Add these four deals:

**Deal 1 — Rs. 1,460**
- Mimi’s Special Pizza, Small.
- Zinger Burger.
- Small Fries.
- 500 ml Drink.

**Deal 2 — Rs. 1,530**
- Any Regular Flavour Small Pizza.
- Creamy Pasta, Half.
- Chicken Paratha Roll.
- 500 ml Drink.

**Deal 3 — Rs. 1,780**
- Any Regular Flavour Medium Pizza.
- 6 Hot Wings.
- 1 Liter Drink.

**Deal 4 — Rs. 2,480**
- Any Regular Flavour Large Pizza.
- Small Pizza.
- 1.5 Liter Drink.

Display the price prominently on every deal card.

Show a short description of the included items.

When a deal is added to the cart, represent it as one priced bundle line with its description. Do not separately add the bundle components as additional charged cart items.

For deals that allow any regular pizza flavour, provide a simple flavour selector if practical. The deal must retain its original advertised bundle price.

### B. Pizza

Add these three pizza flavours with size-specific pricing.

**Chicken Lover Pizza — Regular**
- Small: Rs. 650
- Medium: Rs. 1,200
- Large: Rs. 1,600
- Family: Rs. 2,400

**Mimi’s Special Pizza — Special**
- Small: Rs. 700
- Medium: Rs. 1,300
- Large: Rs. 1,700
- Family: Rs. 2,500

**Behari Kabab Pizza — Signature**
- Medium: Rs. 1,400
- Large: Rs. 1,800
- Family: Rs. 2,600
- Small is unavailable.

For pizzas, selecting a product card should open a simple, polished size-selection dialog or modal.

The modal must display:

- Pizza name.
- Available sizes.
- Correct price for each size.
- A clearly highlighted selected size.
- An Add to Order button.
- A Cancel or Close action.

Do not automatically add a pizza before its required size has been selected.

Once added, display the pizza name and selected size in the cart, with the correct price.

Show “From Rs. 650” or the appropriate starting price on product cards when a product has multiple sizes.

### C. Burgers

Add these three menu items:

- Mighty Zinger Burger — Rs. 650
- Tender Fillet Burger — Rs. 400
- Zinger Burger — Rs. 380

Clicking a burger should add one unit to the cart immediately and provide visible feedback.

If the same burger is added again, increase its quantity where appropriate rather than unnecessarily creating duplicate cart rows.

### D. Drinks

Add these sample drink options:

- Coke, 500 ml — Rs. 130
- Sprite, 500 ml — Rs. 130
- Coke, 1 Liter — Rs. 180

Use the listed size-based pricing.

These products are included to demonstrate a realistic ordering workflow. Keep the product data easy to expand or correct later.

## 8. Product Cards

Design attractive, consistent product cards.

Each card should contain:

- Product name.
- Category or relevant size information.
- Price or starting price.
- A clear selection or add action.
- A compact food thumbnail where suitable.

Use consistent image dimensions and crops. If an image is missing or fails to load, display a clean fallback rather than a broken-image icon.

Do not spend time building a complicated image-management system.

Cards should have subtle hover feedback on desktop and clear tap feedback on touch devices.

For simple items, tapping the card should add the product to the order. For size-dependent pizzas, open the required selection modal.

## 9. Functional Shopping Cart and Billing

The current order panel is one of the most important components.

Implement real cart functionality using frontend state.

Each cart row should display:

- Product or deal name.
- Selected pizza size, when applicable.
- Price per item.
- Quantity controls.
- Line total.
- Remove-item button.

### Quantity controls

Provide clearly visible plus and minus buttons.

- Plus increases the quantity.
- Minus decreases the quantity.
- When quantity reaches zero, remove the item or ask for confirmation if necessary.
- Removing an item must immediately update the total.
- Cart quantities must never become negative.

### Automatic price calculation

Calculate all totals from the current cart state.

Line total = Unit price × Quantity.

Subtotal = Sum of all line totals.

Final total = Subtotal for this demo.

Do not introduce invented taxes, delivery fees, service charges or discounts.

All amounts must update immediately whenever the user adds a product, changes a size, modifies a quantity or removes an item.

Use a single reliable calculation function instead of maintaining separate, potentially inconsistent total values.

### Empty cart state

When there are no items, show a clean empty-state illustration or icon and a brief message such as:

“Your order is empty. Add products from the menu.”

Disable Print Bill when the cart is empty.

### Clear Cart and New Order

Include both actions.

Clear Cart should remove the current cart contents after a confirmation if necessary.

New Order should reset the current order and its optional order details after appropriate confirmation when the cart contains items.

Do not reload the whole page to reset the order.

## 10. Order Type

Include a simple selector with:

- Dine-in
- Takeaway

Make the selected option visually clear.

For Dine-in, display an optional table-number field.

For Takeaway, hide the table-number field.

This is only an order label for the demo. Do not build table reservations, table tracking or kitchen management.

## 11. Receipt Preview and Print Bill

Create a professional receipt that resembles a real restaurant thermal-paper invoice.

When Print Bill is clicked, open a receipt preview modal or dedicated print view.

The receipt must include:

- Mimi’s Pizza.
- “Restaurant Bill” or “Order Receipt”.
- A demo order number.
- Date and time.
- Order type.
- Table number if provided.
- Product names and selected sizes.
- Quantity, unit price and line total.
- Subtotal.
- Final total.
- A short thank-you message.

Use clear alignment and compact receipt typography.

Optimize the receipt for an 80 mm thermal-paper layout, with a narrow receipt width and minimal margins.

Include a clear Print Receipt button and a Back to Order action.

### Printing behaviour

Implement browser-based printing using `window.print()` and appropriate print CSS.

When the print dialog opens, the output must contain only the receipt, not the POS header, product grid, cart controls, modal backdrop or other application elements.

Use print styles such as `@media print` and suitable page-width and margin rules.

Support a normal browser print dialog so the user can select an available printer.

Do not claim that Bluetooth or USB thermal-printer pairing is implemented. Direct printer integration is outside this demo's scope.

After printing or closing the receipt preview, the user should be able to return to the current order without losing its contents.

The receipt should use current cart data and accurate calculated totals, not hardcoded sample totals.

## 12. Important Interaction Details

Make every visible control functional.

Examples:

- Selecting a category filters the products.
- Typing into search filters products.
- Tapping an ordinary product adds it to the cart.
- Selecting a pizza opens its size selector.
- Selecting a pizza size updates the price.
- Adding a deal creates one bundle line in the cart.
- Plus and minus buttons update quantities.
- Remove buttons remove the correct item.
- Totals update immediately.
- Dine-in and Takeaway selection works.
- The table-number field appears only for Dine-in.
- View Order opens the mobile cart.
- Clear Cart and New Order perform their actions.
- Print Bill opens the receipt preview.
- Print Receipt opens the browser's print dialog.

Provide visible feedback after adding items, such as a subtle cart update or brief confirmation.

Do not implement decorative buttons that do nothing.

## 13. Component Structure and Code Quality

Keep the architecture simple and reusable.

Suggested components:

- `POSHeader`
- `CategoryTabs`
- `ProductSearch`
- `ProductGrid`
- `ProductCard`
- `PizzaSizeModal`
- `OrderTypeSelector`
- `CartPanel`
- `CartItem`
- `ReceiptPreview`

Suggested static data file:

- `src/data/menuData.ts`

Separate product data, price calculations and UI components logically.

Keep menu content editable without needing to rewrite the product-card or cart components.

Do not overengineer the application or create unnecessary routes and pages.

## 14. What Not to Build

The following features are explicitly excluded from this demo:

- Backend or database.
- Supabase integration.
- Login or signup.
- Admin dashboard.
- User management.
- Persistent order history.
- Real payment processing.
- Inventory or stock management.
- Sales analytics.
- Supplier management.
- Staff attendance.
- Customer accounts.
- Advanced tax configuration.
- Direct Bluetooth or USB thermal-printer pairing.
- Invoice-template management.
- Multi-branch restaurant functionality.

All sample data and cart interactions should work in the browser only.

Refreshing the page may reset the current order. No persistent storage is required.

## 15. Final Quality Checklist

Before considering the demo complete, verify the following:

1. The application opens directly on the main POS screen.
2. The design looks professional and clearly represents Mimi’s Pizza.
3. The tablet landscape layout displays the menu and cart comfortably side by side.
4. The mobile layout has a two-column product grid and a usable fixed View Order bar.
5. Every category and the search field work correctly.
6. The pizza size selector applies the correct price.
7. Deals are added as single priced bundles.
8. Cart quantities and totals remain accurate.
9. Clear Cart and New Order work correctly.
10. Receipt preview displays the actual current order.
11. Print Bill produces a receipt-only printable layout.
12. No buttons, product controls or navigation elements are broken.
13. There are no horizontal-overflow issues or overlapping elements on mobile.
14. The application works without a database, backend, API key or login.
15. The browser console has no avoidable runtime errors.

Build the complete, polished and functional frontend demo now.

Prioritize the core ordering workflow, tablet usability, mobile responsiveness and accurate billing over adding extra features.

Do not stop at a static mockup. Deliver a working interactive POS prototype using frontend state and static menu data.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://mimi-pizza-pos.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/6b13dfc7-4436-4213-bde0-c55272d07c22).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
