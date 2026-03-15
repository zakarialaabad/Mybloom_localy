# Technical Execution Plan: Add Product Architecture

## Phase 1: Backend Architecture
- Validated existing tables (`products`, `categories`, `brands`, `product_types`, `product_images`, `product_sizes`, `reviews`, `ingredients`).
- Created migration for `product_faqs` to store Product FAQs.
- Added boolean flags `is_best_seller`, `is_gift`, and `is_recommended` to the `products` table.

## Phase 2: Product Data
- The controller will query `Category::all()`, `ProductType::all()`, and `Brand::all()` and send to the UI.

## Phase 3: Product Media 
- Product images will be captured as a `multipart/form-data` request.
- The first image will be saved as `cover_image=1` in the `product_images` table.
- Images 2-4 will be saved as gradient images respectively.

## Phase 4: Pricing Variants
- Handled dynamically. The fields will be mapped to the `product_sizes` table (`size`, `unit`, `price`, `discount_percentage`, etc) 

## Phase 5: Status Settings
- Linked directly to `is_best_seller`, `is_gift`, `is_recommended`.

## Phase 6-8: Reviews & FAQs
- Linked to `reviews` and `product_faqs` schemas. Add points for `reviewer_name` handling.

*(Detailed Next-Steps and Code scaffolding ongoing)*
