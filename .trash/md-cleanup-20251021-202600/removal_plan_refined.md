# PMO Code Cleanup Removal Plan - Refined

## Overview
This document outlines a safe, step-by-step plan for removing duplicate and unused CODE FILES from the PMO project.

## Safety Measures
- All deletions will be performed in a dry-run mode first
- Files will be moved to `.trash/` directory instead of permanent deletion
- Each batch will be validated before proceeding to the next
- Configuration files are excluded from this analysis

## Batch 1: Low Risk Files (2 files)
- create-test-token.js (No inbound references found)
- src/components/ui/aspect-ratio.tsx (No inbound references found)

## Batch 2: Medium Risk Files (114 files)
- cleanup.config.json (No inbound references found)
- components.json (No inbound references found)
- create-admin-user.js (No inbound references found)
- database-safety-check.ts (No inbound references found)
- encrypt_ids_pmo.ts (No inbound references found)
- import_cost_data.ts (No inbound references found)
- migration-validation.ts (No inbound references found)
- prisma/seed.ts (No inbound references found)
- reports/duplicates.json (No inbound references found)
- reports/unused_files.json (No inbound references found)
- rollback-validation.ts (No inbound references found)
- scripts/cleanup-analyzer-refined.js (No inbound references found)
- scripts/cleanup-analyzer.js (No inbound references found)
- scripts/cleanup-analyzer.ts (No inbound references found)
- scripts/cleanup-dryrun.ts (No inbound references found)
- scripts/verify-safe-removal.ts (No inbound references found)
- seed-cost-estimator.ts (No inbound references found)
- seed-hjt-tables.ts (No inbound references found)
- seed-kategori.js (No inbound references found)
- seed-project-types.ts (No inbound references found)
- seed-resources.ts (No inbound references found)
- server.ts (No inbound references found)
- src/app/(authenticated)/projects/page-new.tsx (No inbound references found)
- src/app/(authenticated)/projects/page-old.tsx (No inbound references found)
- src/app/(authenticated)/tasks/page-new.tsx (No inbound references found)
- src/app/(authenticated)/tasks/page-old.tsx (No inbound references found)
- src/app/globals.css (No inbound references found)
- src/components/auth/PLNLandscapeLogin.tsx (No inbound references found)
- src/components/auth/SOLARLandscapeLogin.tsx (No inbound references found)
- src/components/cost/ImportPreviewTable.tsx (No inbound references found)
- src/components/cost/ImportTariffWizard.tsx (No inbound references found)
- src/components/cost/TotalsCard.tsx (No inbound references found)
- src/components/monitoring/LicenseForm.tsx (No inbound references found)
- src/components/notification-bell.tsx (No inbound references found)
- src/components/product/AttachmentModal.tsx (No inbound references found)
- src/components/product/ProductCard.tsx (No inbound references found)
- src/components/product/ProductCardSkeleton.tsx (No inbound references found)
- src/components/product/ProductDetailModal.tsx (No inbound references found)
- src/components/product/ProductForm.tsx (No inbound references found)
- src/components/product/ProductGrid.tsx (No inbound references found)
- src/components/product/ProductPage.tsx (No inbound references found)
- src/components/role-management.tsx (No inbound references found)
- src/components/top-navigation.tsx (No inbound references found)
- src/components/ui/accordion.tsx (No inbound references found)
- src/components/ui/alert-dialog.tsx (No inbound references found)
- src/components/ui/alert.tsx (No inbound references found)
- src/components/ui/avatar.tsx (No inbound references found)
- src/components/ui/badge.tsx (No inbound references found)
- src/components/ui/breadcrumb.tsx (No inbound references found)
- src/components/ui/button.tsx (No inbound references found)
- src/components/ui/calendar.tsx (No inbound references found)
- src/components/ui/card.tsx (No inbound references found)
- src/components/ui/carousel.tsx (No inbound references found)
- src/components/ui/chart.tsx (No inbound references found)
- src/components/ui/checkbox.tsx (No inbound references found)
- src/components/ui/collapsible.tsx (No inbound references found)
- src/components/ui/command.tsx (No inbound references found)
- src/components/ui/context-menu.tsx (No inbound references found)
- src/components/ui/currency-input.tsx (No inbound references found)
- src/components/ui/dialog.tsx (No inbound references found)
- src/components/ui/drawer.tsx (No inbound references found)
- src/components/ui/dropdown-menu.tsx (No inbound references found)
- src/components/ui/form.tsx (No inbound references found)
- src/components/ui/hover-card.tsx (No inbound references found)
- src/components/ui/input-otp.tsx (No inbound references found)
- src/components/ui/input.tsx (No inbound references found)
- src/components/ui/label.tsx (No inbound references found)
- src/components/ui/menubar.tsx (No inbound references found)
- src/components/ui/navigation-menu.tsx (No inbound references found)
- src/components/ui/pagination.tsx (No inbound references found)
- src/components/ui/percent-input.tsx (No inbound references found)
- src/components/ui/popover.tsx (No inbound references found)
- src/components/ui/progress.tsx (No inbound references found)
- src/components/ui/radio-group.tsx (No inbound references found)
- src/components/ui/resizable.tsx (No inbound references found)
- src/components/ui/scroll-area.tsx (No inbound references found)
- src/components/ui/select.tsx (No inbound references found)
- src/components/ui/separator.tsx (No inbound references found)
- src/components/ui/sheet.tsx (No inbound references found)
- src/components/ui/sidebar.tsx (No inbound references found)
- src/components/ui/skeleton.tsx (No inbound references found)
- src/components/ui/slider.tsx (No inbound references found)
- src/components/ui/sonner.tsx (No inbound references found)
- src/components/ui/switch.tsx (No inbound references found)
- src/components/ui/table.tsx (No inbound references found)
- src/components/ui/tabs.tsx (No inbound references found)
- src/components/ui/textarea.tsx (No inbound references found)
- src/components/ui/toast.tsx (No inbound references found)
- src/components/ui/toaster.tsx (No inbound references found)
- src/components/ui/toggle-group.tsx (No inbound references found)
- src/components/ui/toggle.tsx (No inbound references found)
- src/components/ui/tooltip.tsx (No inbound references found)
- src/hooks/use-mobile.ts (No inbound references found)
- src/hooks/use-toast.ts (No inbound references found)
- src/hooks/useOptimizedFetch.ts (No inbound references found)
- src/icons/index.tsx (No inbound references found)
- src/lib/auth.ts (No inbound references found)
- src/lib/cost-calculator.ts (No inbound references found)
- src/lib/currency-utils.ts (No inbound references found)
- src/lib/database.ts (No inbound references found)
- src/lib/db.ts (No inbound references found)
- src/lib/notifications.ts (No inbound references found)
- src/lib/permissions.ts (No inbound references found)
- src/lib/socket.ts (No inbound references found)
- src/lib/utils.ts (No inbound references found)
- src/services/excelExportService.ts (No inbound references found)
- src/services/pdfExportService.ts (No inbound references found)
- src/services/secureExcelService.ts (No inbound references found)
- src/services/timelineService.ts (No inbound references found)
- src/types/index.ts (No inbound references found)
- src/types/timeline.types.ts (No inbound references found)
- src/utils/productUtils.ts (No inbound references found)
- sync_lifecycle_to_pmo.ts (No inbound references found)
- update-project-types.js (No inbound references found)

## Batch 3: High Risk Files (1 files)
- src/lib/api.ts (No inbound references found)

## Duplicate Files (0 groups)


## Validation Steps
1. Run TypeScript build: `npm run build`
2. Run ESLint: `npm run lint`
3. Run tests: `npm run test`
4. Start dev server: `npm run dev`
5. Verify health endpoint: `curl http://localhost:3000/api/health`

## Rollback Plan
If issues are detected:
1. Restore from trash: `mv .trash/* ./`
2. Revert git changes: `git revert <commit-hash>`
3. Restore from backup: Use backup files created earlier

## Next Steps
1. Create feature branch: `git checkout -b chore/cleanup-dryrun`
2. Run dry-run script: `node scripts/cleanup-dryrun.js`
3. Validate results
4. Create PR with detailed report
