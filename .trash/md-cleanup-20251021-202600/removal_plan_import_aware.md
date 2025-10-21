# PMO Code Cleanup Removal Plan - Import-Aware

## Overview
This document outlines a safe, step-by-step plan for removing duplicate and unused CODE FILES from the PMO project.
This analysis uses actual import graph traversal to determine unused files.

## Safety Measures
- All deletions will be performed in a dry-run mode first
- Files will be moved to `.trash/` directory instead of permanent deletion
- Each batch will be validated before proceeding to the next
- Analysis based on actual import/export relationships

## Batch 1: Low Risk Files (2 files)
- create-test-token.js (No inbound references found in import graph)
- src/components/ui/aspect-ratio.tsx (No inbound references found in import graph)

## Batch 2: Medium Risk Files (111 files)
- create-admin-user.js (No inbound references found in import graph)
- database-safety-check.ts (No inbound references found in import graph)
- encrypt_ids_pmo.ts (No inbound references found in import graph)
- import_cost_data.ts (No inbound references found in import graph)
- migration-validation.ts (No inbound references found in import graph)
- prisma/seed.ts (No inbound references found in import graph)
- rollback-validation.ts (No inbound references found in import graph)
- scripts/cleanup-analyzer-import-aware.js (No inbound references found in import graph)
- scripts/cleanup-analyzer-refined.js (No inbound references found in import graph)
- scripts/cleanup-analyzer.js (No inbound references found in import graph)
- scripts/cleanup-analyzer.ts (No inbound references found in import graph)
- scripts/cleanup-dryrun.ts (No inbound references found in import graph)
- scripts/verify-safe-removal.ts (No inbound references found in import graph)
- seed-cost-estimator.ts (No inbound references found in import graph)
- seed-hjt-tables.ts (No inbound references found in import graph)
- seed-kategori.js (No inbound references found in import graph)
- seed-project-types.ts (No inbound references found in import graph)
- seed-resources.ts (No inbound references found in import graph)
- server.ts (No inbound references found in import graph)
- src/app/(authenticated)/projects/page-new.tsx (No inbound references found in import graph)
- src/app/(authenticated)/projects/page-old.tsx (No inbound references found in import graph)
- src/app/(authenticated)/tasks/page-new.tsx (No inbound references found in import graph)
- src/app/(authenticated)/tasks/page-old.tsx (No inbound references found in import graph)
- src/app/globals.css (No inbound references found in import graph)
- src/components/auth/PLNLandscapeLogin.tsx (No inbound references found in import graph)
- src/components/auth/SOLARLandscapeLogin.tsx (No inbound references found in import graph)
- src/components/cost/ImportPreviewTable.tsx (No inbound references found in import graph)
- src/components/cost/ImportTariffWizard.tsx (No inbound references found in import graph)
- src/components/cost/TotalsCard.tsx (No inbound references found in import graph)
- src/components/monitoring/LicenseForm.tsx (No inbound references found in import graph)
- src/components/notification-bell.tsx (No inbound references found in import graph)
- src/components/product/AttachmentModal.tsx (No inbound references found in import graph)
- src/components/product/ProductCard.tsx (No inbound references found in import graph)
- src/components/product/ProductCardSkeleton.tsx (No inbound references found in import graph)
- src/components/product/ProductDetailModal.tsx (No inbound references found in import graph)
- src/components/product/ProductForm.tsx (No inbound references found in import graph)
- src/components/product/ProductGrid.tsx (No inbound references found in import graph)
- src/components/product/ProductPage.tsx (No inbound references found in import graph)
- src/components/role-management.tsx (No inbound references found in import graph)
- src/components/top-navigation.tsx (No inbound references found in import graph)
- src/components/ui/accordion.tsx (No inbound references found in import graph)
- src/components/ui/alert-dialog.tsx (No inbound references found in import graph)
- src/components/ui/alert.tsx (No inbound references found in import graph)
- src/components/ui/avatar.tsx (No inbound references found in import graph)
- src/components/ui/badge.tsx (No inbound references found in import graph)
- src/components/ui/breadcrumb.tsx (No inbound references found in import graph)
- src/components/ui/button.tsx (No inbound references found in import graph)
- src/components/ui/calendar.tsx (No inbound references found in import graph)
- src/components/ui/card.tsx (No inbound references found in import graph)
- src/components/ui/carousel.tsx (No inbound references found in import graph)
- src/components/ui/chart.tsx (No inbound references found in import graph)
- src/components/ui/checkbox.tsx (No inbound references found in import graph)
- src/components/ui/collapsible.tsx (No inbound references found in import graph)
- src/components/ui/command.tsx (No inbound references found in import graph)
- src/components/ui/context-menu.tsx (No inbound references found in import graph)
- src/components/ui/currency-input.tsx (No inbound references found in import graph)
- src/components/ui/dialog.tsx (No inbound references found in import graph)
- src/components/ui/drawer.tsx (No inbound references found in import graph)
- src/components/ui/dropdown-menu.tsx (No inbound references found in import graph)
- src/components/ui/form.tsx (No inbound references found in import graph)
- src/components/ui/hover-card.tsx (No inbound references found in import graph)
- src/components/ui/input-otp.tsx (No inbound references found in import graph)
- src/components/ui/input.tsx (No inbound references found in import graph)
- src/components/ui/label.tsx (No inbound references found in import graph)
- src/components/ui/menubar.tsx (No inbound references found in import graph)
- src/components/ui/navigation-menu.tsx (No inbound references found in import graph)
- src/components/ui/pagination.tsx (No inbound references found in import graph)
- src/components/ui/percent-input.tsx (No inbound references found in import graph)
- src/components/ui/popover.tsx (No inbound references found in import graph)
- src/components/ui/progress.tsx (No inbound references found in import graph)
- src/components/ui/radio-group.tsx (No inbound references found in import graph)
- src/components/ui/resizable.tsx (No inbound references found in import graph)
- src/components/ui/scroll-area.tsx (No inbound references found in import graph)
- src/components/ui/select.tsx (No inbound references found in import graph)
- src/components/ui/separator.tsx (No inbound references found in import graph)
- src/components/ui/sheet.tsx (No inbound references found in import graph)
- src/components/ui/sidebar.tsx (No inbound references found in import graph)
- src/components/ui/skeleton.tsx (No inbound references found in import graph)
- src/components/ui/slider.tsx (No inbound references found in import graph)
- src/components/ui/sonner.tsx (No inbound references found in import graph)
- src/components/ui/switch.tsx (No inbound references found in import graph)
- src/components/ui/table.tsx (No inbound references found in import graph)
- src/components/ui/tabs.tsx (No inbound references found in import graph)
- src/components/ui/textarea.tsx (No inbound references found in import graph)
- src/components/ui/toast.tsx (No inbound references found in import graph)
- src/components/ui/toaster.tsx (No inbound references found in import graph)
- src/components/ui/toggle-group.tsx (No inbound references found in import graph)
- src/components/ui/toggle.tsx (No inbound references found in import graph)
- src/components/ui/tooltip.tsx (No inbound references found in import graph)
- src/hooks/use-mobile.ts (No inbound references found in import graph)
- src/hooks/use-toast.ts (No inbound references found in import graph)
- src/hooks/useOptimizedFetch.ts (No inbound references found in import graph)
- src/icons/index.tsx (No inbound references found in import graph)
- src/lib/auth.ts (No inbound references found in import graph)
- src/lib/cost-calculator.ts (No inbound references found in import graph)
- src/lib/currency-utils.ts (No inbound references found in import graph)
- src/lib/database.ts (No inbound references found in import graph)
- src/lib/db.ts (No inbound references found in import graph)
- src/lib/notifications.ts (No inbound references found in import graph)
- src/lib/permissions.ts (No inbound references found in import graph)
- src/lib/socket.ts (No inbound references found in import graph)
- src/lib/utils.ts (No inbound references found in import graph)
- src/services/excelExportService.ts (No inbound references found in import graph)
- src/services/pdfExportService.ts (No inbound references found in import graph)
- src/services/secureExcelService.ts (No inbound references found in import graph)
- src/services/timelineService.ts (No inbound references found in import graph)
- src/types/index.ts (No inbound references found in import graph)
- src/types/timeline.types.ts (No inbound references found in import graph)
- src/utils/productUtils.ts (No inbound references found in import graph)
- sync_lifecycle_to_pmo.ts (No inbound references found in import graph)
- update-project-types.js (No inbound references found in import graph)

## Batch 3: High Risk Files (1 files)
- src/lib/api.ts (No inbound references found in import graph)

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
