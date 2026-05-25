// TerminalOutputDemo.jsx
// Embed in existing landing page — self-contained, no page-level layout.
// Requires: React 18+, Tailwind CSS (JIT), JetBrains Mono loaded via Google Fonts.
// Colors match existing landing palette: #000/#0a0a0a/#111/#1a1a1a, accent #6ee7f7.
//
// Usage:
//   import TerminalOutputDemo from "./TerminalOutputDemo";
//   <TerminalOutputDemo />
//
// Add to tailwind.config.js → theme.extend.fontFamily:
//   mono: ['"JetBrains Mono"', 'monospace'],

"use client";
import { useState } from "react";

/* ══════════════════════════════════════════════════════ UTILITIES ══ */

const cn = (...c) => c.filter(Boolean).join(" ");

function splitFQN(fqn) {
  const i = fqn.lastIndexOf(".");
  return i === -1 ? { pkg: "", cls: fqn } : { pkg: fqn.slice(0, i), cls: fqn.slice(i + 1) };
}

/* ══════════════════════════════════════════════════════════ DATA ══ */

const COMMANDS = [
  { id: "impact",  label: "impact OrderService .", cmd: "sourcecode impact OrderService ." },
  { id: "onboard", label: "onboard .",             cmd: "sourcecode onboard ."             },
  { id: "compact", label: "--compact",              cmd: "sourcecode --compact"              },
];

const IMPACT = {
  target: "OrderService",
  matched_fqns: ["org.broadleafcommerce.core.order.service.OrderService"],
  resolution: "exact",
  risk_score: 100.0,
  risk_level: "high",
  confidence_score: 1.0,
  confidence_level: "high",
  explanation: "Risk=HIGH: 74 direct callers; 180 indirect callers; 11 endpoints exposed; 20 persistence paths in blast cone; impact crosses 2 modules.",
  direct_callers: [
    "org.broadleafcommerce.core.checkout.service.CheckoutServiceImpl",
    "org.broadleafcommerce.core.checkout.service.CheckoutServiceImpl.orderService",
    "org.broadleafcommerce.core.checkout.service.gateway.PassthroughPaymentRollbackServiceImpl",
    "org.broadleafcommerce.core.checkout.service.gateway.PassthroughPaymentRollbackServiceImpl.orderService",
    "org.broadleafcommerce.core.checkout.service.workflow.ConfirmPaymentsRollbackHandler",
    "org.broadleafcommerce.core.checkout.service.workflow.ConfirmPaymentsRollbackHandler.orderService",
    "org.broadleafcommerce.core.offer.service.OfferService",
    "org.broadleafcommerce.core.offer.service.OfferServiceImpl",
    "org.broadleafcommerce.core.offer.service.OfferServiceImpl.orderService",
    "org.broadleafcommerce.core.order.event.NotificationOrderSubmittedEventListener",
    "org.broadleafcommerce.core.order.event.NotificationOrderSubmittedEventListener.orderService",
    "org.broadleafcommerce.core.order.service.call.OrderItemRequestDTO",
    "org.broadleafcommerce.core.order.service.workflow.AddWorkflowPriceOrderIfNecessaryActivity",
    "org.broadleafcommerce.core.order.service.workflow.AddWorkflowPriceOrderIfNecessaryActivity.orderService",
    "org.broadleafcommerce.core.order.service.workflow.add.AddOrderItemActivity",
    "org.broadleafcommerce.core.order.service.workflow.add.AddOrderItemActivity.orderService",
    "org.broadleafcommerce.core.order.service.workflow.add.ValidateAddRequestActivity",
    "org.broadleafcommerce.core.order.service.workflow.add.ValidateAddRequestActivity.orderService",
    "org.broadleafcommerce.core.order.service.workflow.remove.RemoveOrderItemActivity",
    "org.broadleafcommerce.core.order.service.workflow.remove.RemoveOrderItemActivity.orderService",
    "org.broadleafcommerce.core.order.service.workflow.update.UpdateOrderItemActivity",
    "org.broadleafcommerce.core.order.service.workflow.update.UpdateOrderItemActivity.orderService",
    "org.broadleafcommerce.core.order.service.workflow.update.options.UpdateProductOptionsOrderItemActivity",
    "org.broadleafcommerce.core.order.service.workflow.update.options.UpdateProductOptionsOrderItemActivity.orderService",
    "org.broadleafcommerce.core.order.strategy.FulfillmentGroupItemStrategyImpl",
    "org.broadleafcommerce.core.order.strategy.FulfillmentGroupItemStrategyImpl.orderService",
    "org.broadleafcommerce.core.payment.service.DefaultPaymentGatewayCheckoutService",
    "org.broadleafcommerce.core.payment.service.DefaultPaymentGatewayCheckoutService.orderService",
    "org.broadleafcommerce.core.pricing.service.workflow.AutoBundleActivity",
    "org.broadleafcommerce.core.pricing.service.workflow.AutoBundleActivity.orderService",
  ],
  direct_callers_note: "Showing 30/74 direct callers. Use --output to inspect full IR.",
  indirect_callers: [
    "org.broadleafcommerce.admin.web.controller.entity.AdminOfferController",
    "org.broadleafcommerce.core.offer.dao.OfferAuditDao",
    "org.broadleafcommerce.core.offer.service.workflow.RecordOfferUsageActivity",
    "org.broadleafcommerce.core.offer.service.workflow.VerifyCustomerMaxOfferUsesActivity",
    "org.broadleafcommerce.core.order.service.OrderServiceImpl",
    "org.broadleafcommerce.core.pricing.service.workflow.CountTotalOffersActivity",
    "org.broadleafcommerce.core.pricing.service.workflow.DetermineOfferChangeActivity",
    "org.broadleafcommerce.admin.web.controller.entity.AdminOfferController.offerService",
    "org.broadleafcommerce.core.offer.service.workflow.RecordOfferUsageActivity.offerService",
    "org.broadleafcommerce.core.offer.service.workflow.VerifyCustomerMaxOfferUsesActivity.offerService",
    "org.broadleafcommerce.core.order.service.OrderServiceImpl.offerService",
    "org.broadleafcommerce.core.pricing.service.workflow.CountTotalOffersActivity.offerService",
    "org.broadleafcommerce.core.pricing.service.workflow.DetermineOfferChangeActivity.offerService",
    "org.broadleafcommerce.core.pricing.service.workflow.OfferActivity.offerService",
    "org.broadleafcommerce.core.web.controller.cart.AbstractCartController.offerService",
    "org.broadleafcommerce.core.order.service.OrderItemService",
    "org.broadleafcommerce.core.order.service.OrderItemServiceImpl",
    "org.broadleafcommerce.core.order.service.OrderServiceExtensionHandler",
    "org.broadleafcommerce.core.order.service.OrderServiceExtensionManager",
    "org.broadleafcommerce.core.order.service.workflow.CartOperationRequest",
    "org.broadleafcommerce.core.order.service.workflow.CheckAddAvailabilityActivity",
    "org.broadleafcommerce.core.order.service.workflow.CheckUpdateAvailabilityActivity",
    "org.broadleafcommerce.core.order.service.workflow.remove.ValidateRemoveRequestActivity",
    "org.broadleafcommerce.core.order.service.workflow.service.OrderItemRequestValidationService",
    "org.broadleafcommerce.core.order.service.workflow.service.OrderItemRequestValidationServiceImpl",
    "org.broadleafcommerce.core.order.service.workflow.update.ValidateUpdateRequestActivity",
    "org.broadleafcommerce.core.order.service.workflow.update.options.ValidateUpdateProductOptionsRequestActivity",
    "org.broadleafcommerce.core.web.controller.account.BroadleafManageWishlistController",
    "org.broadleafcommerce.core.web.controller.cart.BroadleafCartController",
    "org.broadleafcommerce.core.web.service.UpdateCartService",
    "org.broadleafcommerce.core.web.service.UpdateCartServiceExtensionHandler",
    "org.broadleafcommerce.core.web.controller.checkout.BroadleafCheckoutController",
    "org.broadleafcommerce.core.web.order.CartState",
    "org.broadleafcommerce.admin.web.controller.extension.AdminOfferControllerExtensionHandler",
    "org.broadleafcommerce.core.offer.service.OfferAuditServiceImpl",
    "org.broadleafcommerce.core.offer.service.OfferAuditServiceImpl.offerAuditDao",
    "org.broadleafcommerce.core.order.service.workflow.remove.RemoveOrderMultishipOptionActivity",
    "org.broadleafcommerce.core.order.service.workflow.update.UpdateOrderMultishipOptionActivity",
    "org.broadleafcommerce.core.web.controller.catalog.BroadleafProductController",
    "org.broadleafcommerce.core.web.controller.catalog.BroadleafProductController.ResourceNotFoundException",
    "org.broadleafcommerce.core.order.service.workflow.AddWorkflowPriceOrderIfNecessaryActivity.orderItemService",
    "org.broadleafcommerce.core.order.service.workflow.CheckAddAvailabilityActivity.orderItemService",
    "org.broadleafcommerce.core.order.service.workflow.CheckUpdateAvailabilityActivity.orderItemService",
    "org.broadleafcommerce.core.order.service.workflow.add.AddOrderItemActivity.orderItemService",
    "org.broadleafcommerce.core.order.service.workflow.add.ValidateAddRequestActivity.orderItemService",
    "org.broadleafcommerce.core.order.service.workflow.remove.RemoveOrderItemActivity.orderItemService",
    "org.broadleafcommerce.core.order.service.workflow.remove.RemoveOrderMultishipOptionActivity.orderItemService",
    "org.broadleafcommerce.core.order.service.workflow.remove.ValidateRemoveRequestActivity.orderItemService",
    "org.broadleafcommerce.core.order.service.workflow.update.UpdateOrderMultishipOptionActivity.orderItemService",
    "org.broadleafcommerce.core.order.service.workflow.update.ValidateUpdateRequestActivity.orderItemService",
  ],
  indirect_callers_note: "Showing 50/180 indirect callers. Use --output to inspect full IR.",
  endpoints_affected: [
    { method: "GET",  path: "/offer",             cls: "AdminOfferController",                    handler: "viewEntityList" },
    { method: "POST", path: "/offer/add",          cls: "AdminOfferController",                    handler: "addEntity" },
    { method: "GET",  path: "/offer/add",          cls: "AdminOfferController",                    handler: "viewAddEntityForm" },
    { method: "GET",  path: "/offer/{id}",         cls: "AdminOfferController",                    handler: "viewEntityForm" },
    { method: "POST", path: "/offer/{id}/duplicate", cls: "AdminOfferController",                  handler: "duplicateEntity" },
    { method: "GET",  path: "/product/{id}",       cls: "AdminProductController",                  handler: "viewEntityForm" },
    { method: "GET",  path: "/product/{id}/{collectionField:[^0-9].*}/{collectionItemId}", cls: "AdminProductController", handler: "showUpdateCollectionItem" },
    { method: "GET",  path: "/product/{id}/{collectionField}/add", cls: "AdminProductController",  handler: "showAddCollectionItem" },
    { method: "GET",  path: "/...InventoryImpl/{collectionField:.*}/select", cls: "AdminInventoryBasicOperationsController", handler: "showSelectCollectionItem" },
    { method: "GET",  path: "/",                   cls: "BroadleafOauthRegisterController",        handler: "register" },
    { method: "GET",  path: "/action=register",    cls: "BroadleafOauthRegisterController",        handler: "processRegister" },
  ],
  mappers_affected: [
    { fqn: "org.broadleafcommerce.core.catalog.dao.AdditionStatusDaoExtensionHandler",  role: "controller"  },
    { fqn: "org.broadleafcommerce.core.catalog.dao.AdditionStatusDaoExtensionManager",  role: "service"     },
    { fqn: "org.broadleafcommerce.core.catalog.dao.CategoryDao",                         role: "repository"  },
    { fqn: "org.broadleafcommerce.core.catalog.dao.CategoryDaoExtensionHandler",         role: "controller"  },
    { fqn: "org.broadleafcommerce.core.catalog.dao.CategoryDaoExtensionManager",         role: "service"     },
    { fqn: "org.broadleafcommerce.core.catalog.dao.CategoryDaoImpl",                     role: "repository"  },
    { fqn: "org.broadleafcommerce.core.catalog.dao.CategoryXrefDao",                     role: "repository"  },
    { fqn: "org.broadleafcommerce.core.catalog.dao.CategoryXrefDaoImpl",                 role: "repository"  },
    { fqn: "org.broadleafcommerce.core.catalog.dao.FeaturedProductDao",                  role: "repository"  },
    { fqn: "org.broadleafcommerce.core.catalog.dao.FeaturedProductDaoImpl",              role: "repository"  },
    { fqn: "org.broadleafcommerce.core.catalog.dao.ProductDao",                          role: "repository"  },
    { fqn: "org.broadleafcommerce.core.catalog.dao.ProductDaoExtensionHandler",          role: "controller"  },
    { fqn: "org.broadleafcommerce.core.catalog.dao.ProductDaoExtensionManager",          role: "service"     },
    { fqn: "org.broadleafcommerce.core.catalog.dao.ProductDaoImpl",                      role: "repository"  },
    { fqn: "org.broadleafcommerce.core.catalog.dao.ProductOptionDao",                    role: "repository"  },
    { fqn: "org.broadleafcommerce.core.catalog.dao.ProductOptionDaoImpl",                role: "repository"  },
    { fqn: "org.broadleafcommerce.core.catalog.dao.SkuDao",                              role: "repository"  },
    { fqn: "org.broadleafcommerce.core.catalog.dao.SkuDaoExtensionHandler",              role: "controller"  },
    { fqn: "org.broadleafcommerce.core.catalog.dao.SkuDaoExtensionManager",              role: "service"     },
    { fqn: "org.broadleafcommerce.core.catalog.dao.SkuDaoImpl",                          role: "repository"  },
  ],
  cross_module_impact: [
    { module: "broadleafcommerce.core",  package_prefix: "org.broadleafcommerce.core",  affected_symbol_count: 290 },
    { module: "broadleafcommerce.admin", package_prefix: "org.broadleafcommerce.admin", affected_symbol_count: 25  },
  ],
  stats: {
    direct_caller_count: 74,
    indirect_caller_count: 180,
    endpoints_affected_count: 11,
    transactional_boundaries_count: 0,
    mappers_affected_count: 20,
    modules_affected_count: 2,
    security_surface_count: 0,
  },
  depth_reached: 4,
  bfs_truncated: false,
};

const ONBOARD = {
  task: "onboard",
  run_id: "adfd4105a7502b87",
  project_summary: 'Broadleaf Commerce CE — e-commerce framework in Java / Spring. Targeted at enterprise-class commerce sites. Core platform covers key retail feature sets. Interoperability via standards + best-of-breed OSS. Unified codebase: site + admin deployment. Stack: Java (Spring Boot, Spring MVC). Domains: admin, integration. 2,659 Java classes, 41 transactional boundaries.',
  architecture_summary: "Java REST API using Spring Boot, Spring MVC.\nLayered Architecture: controller → service → repository → infrastructure.\nDetected frameworks: Spring Boot, Spring MVC, Spring Security, Spring LDAP, Spring AOP.",
  confidence: "high",
  entry_points: {
    security: [
      "core/broadleaf-framework-web/src/main/java/org/broadleafcommerce/common/web/security/SecurityControllerAdvise.java",
      "common/src/main/java/org/broadleafcommerce/common/security/handler/SecurityFilter.java",
      "common/src/main/java/org/broadleafcommerce/common/security/handler/CsrfFilter.java",
      "common/src/main/java/org/broadleafcommerce/common/web/ThemeUrlEncodingFilter.java",
      "common/src/main/java/org/broadleafcommerce/common/web/util/PrecompressedArtifactFilter.java",
      "common/src/main/java/org/broadleafcommerce/common/web/util/HtmlMinifyFilter.java",
      "common/src/main/java/org/broadleafcommerce/common/web/filter/EntityManagerFindValidationFilter.java",
      "common/src/main/java/org/broadleafcommerce/common/web/filter/SecurityBasedIgnoreFilter.java",
      "common/src/main/java/org/broadleafcommerce/common/web/filter/AbstractIgnorableOncePerRequestFilter.java",
      "common/src/main/java/org/broadleafcommerce/common/web/filter/AbstractIgnorableFilter.java",
    ],
    controllers: {
      classes: 21,
      methods: 21,
      note: "21 detected entry-point methods across 21 controller classes (use 'sourcecode endpoints' for full surface)",
      modules: ["action", "controller", "entity", "inventory", "web"],
    },
  },
  transactional_boundaries: {
    count: 29,
    classes: [
      "OrderMultishipOptionDaoImpl",
      "OrderItemDaoImpl",
      "OrderDaoImpl",
      "OrderServiceImpl",
      "FulfillmentGroupServiceImpl",
      "FulfillmentOptionServiceImpl",
      "OfferServiceImpl",
      "OfferAuditServiceImpl",
      "RatingServiceImpl",
      "CodeTypeServiceImpl",
    ],
    truncated: true,
    note: "showing 10 of 29; use --full to see all 29",
  },
  relevant_files: [
    { path: "core/broadleaf-framework-web/src/main/java/org/broadleafcommerce/common/web/security/SecurityControllerAdvise.java",        role: "entrypoint", score: 1.0, explanation: "Spring @ControllerAdvice — cross-cutting exception handling" },
    { path: "core/broadleaf-profile-web/src/main/java/org/broadleafcommerce/profile/web/controller/CustomerPhoneController.java",        role: "entrypoint", score: 1.0, explanation: "runtime entrypoint, workspace source root" },
    { path: "common/src/main/java/org/broadleafcommerce/common/exception/FileUploadExceptionAdvice.java",                                role: "entrypoint", score: 1.0, explanation: "Spring @ControllerAdvice — cross-cutting exception handling" },
    { path: "core/broadleaf-profile-web/src/main/java/org/broadleafcommerce/profile/web/controller/RegisterCustomerController.java",    role: "entrypoint", score: 1.0, explanation: "runtime entrypoint, workspace source root" },
    { path: "admin/broadleaf-admin-module/src/main/java/org/broadleafcommerce/admin/web/controller/entity/AdminBaseProductController.java", role: "entrypoint", score: 1.0, explanation: "Domain model — AdminBaseProductController" },
    { path: "admin/broadleaf-open-admin-platform/src/main/java/org/broadleafcommerce/openadmin/web/controller/entity/AdminBasicEntityController.java", role: "entrypoint", score: 1.0, explanation: "Domain model — AdminBasicEntityController" },
    { path: "admin/broadleaf-admin-module/src/main/java/org/broadleafcommerce/admin/web/controller/action/AdminCatalogActionsController.java", role: "entrypoint", score: 1.0, explanation: "runtime entrypoint" },
    { path: "admin/broadleaf-admin-module/src/main/java/org/broadleafcommerce/admin/web/controller/inventory/AdminInventoryBasicOperationsController.java", role: "entrypoint", score: 1.0, explanation: "runtime entrypoint" },
    { path: "admin/broadleaf-contentmanagement-module/src/main/java/org/broadleafcommerce/cms/admin/web/controller/AdminAssetController.java", role: "entrypoint", score: 1.0, explanation: "runtime entrypoint" },
    { path: "admin/broadleaf-open-admin-platform/src/main/java/org/broadleafcommerce/openadmin/web/controller/AdminLoginController.java", role: "entrypoint", score: 1.0, explanation: "runtime entrypoint" },
  ],
  gaps: [
    "Dependencies not analyzed — use the full analyze command with dependency flags for complete context",
    "Environment variables not analyzed — run with --env-map for operational context",
    "No OpenAPI/Swagger contract detected — agents cannot auto-discover API surface without it",
  ],
  deployment: { packaging: "pom" },
};

const COMPACT = {
  schema_version: "1.0",
  project_type: "api",
  project_summary: 'Broadleaf Commerce CE — e-commerce framework in Java / Spring. Enterprise-class commerce sites. Core platform covers key retail feature sets. Stack: Java (Spring Boot, Spring MVC). Domains: admin, integration. 2,659 Java classes, 41 transactional boundaries.',
  architecture_summary: "Java REST API using Spring Boot, Spring MVC.\nLayered Architecture: controller → service → repository → infrastructure.\nDetected frameworks: Spring Boot, Spring MVC, Spring Security, Spring LDAP, Spring AOP.",
  stacks: [
    { stack: "java", detection_method: "manifest", confidence: "high", primary: true, frameworks: ["Spring Boot", "Spring MVC", "Spring Security", "Spring LDAP", "Spring AOP"], package_manager: "maven" },
  ],
  entry_points: {
    security: [
      "common/src/main/java/org/broadleafcommerce/common/security/handler/SecurityFilter.java",
      "common/src/main/java/org/broadleafcommerce/common/security/handler/CsrfFilter.java",
      "common/src/main/java/org/broadleafcommerce/common/web/filter/EntityManagerFindValidationFilter.java",
      "common/src/main/java/org/broadleafcommerce/common/web/filter/SecurityBasedIgnoreFilter.java",
      "common/src/main/java/org/broadleafcommerce/common/web/filter/AbstractIgnorableOncePerRequestFilter.java",
      "common/src/main/java/org/broadleafcommerce/common/web/filter/AbstractIgnorableFilter.java",
    ],
    controllers: { classes: 21, methods: 21, note: "21 detected across 21 controller classes", modules: ["action", "controller", "entity", "inventory", "web"] },
  },
  dependency_summary: { total_count: 91, direct: 91, sources: ["manifest"] },
  key_dependencies: [
    "org.springframework.boot:spring-boot-autoconfigure",
    "org.springframework.security:spring-security-core",
    "org.springframework.security:spring-security-ldap",
    "org.springframework.security:spring-security-web",
    "com.google.guava:guava",
    "org.apache.commons:commons-lang3",
    "org.apache.commons:commons-collections4",
    "jakarta.servlet:jakarta.servlet-api",
    "jakarta.validation:jakarta.validation-api",
    "org.ehcache:ehcache",
    "org.aspectj:aspectjweaver",
    "commons-io:commons-io",
    "ch.qos.logback:logback-classic",
    "javax.cache:cache-api",
    "org.broadleafcommerce:broadleaf-framework",
    "org.broadleafcommerce:broadleaf-framework-web",
    "org.broadleafcommerce:broadleaf-admin-module",
    "org.broadleafcommerce:broadleaf-common",
    "org.broadleafcommerce:broadleaf-profile",
    "org.broadleafcommerce:broadleaf-contentmanagement-module",
  ],
  code_notes_summary: { total: 79, by_kind: { TODO: 58, NOTE: 15, OPTIMIZE: 4, BUG: 1, FIXME: 1 } },
  code_notes: [
    { kind: "BUG",    path: "common/src/main/java/org/broadleafcommerce/common/util/sql/importsql/DemoPostgresSingleLineSqlCommandExtractor.java", line: 58,  text: "s.java.com/view_bug.do?bug_id=5050507" },
    { kind: "FIXME",  path: "integration/src/test/java/org/broadleafcommerce/core/order/dao/OrderDaoTest.java",                                            line: 72,  text: "After the change to cascading the deletion on PaymentResponseItems, this test does not work but for a really..." },
    { kind: "TODO",   path: "admin/broadleaf-admin-module/src/main/java/org/broadleafcommerce/admin/server/service/handler/SkuCustomPersistenceHandler.java", line: 280, text: "we shouldn't have to filter out these keys here — should be able to exclude using @AdminPresentation" },
    { kind: "TODO",   path: "admin/broadleaf-admin-module/src/main/java/org/broadleafcommerce/admin/web/rulebuilder/service/OrderItemFieldServiceImpl.java", line: 38,  text: "extensibility mechanism, support i18N" },
    { kind: "TODO",   path: "admin/broadleaf-contentmanagement-module/.../NonAutoconfigMultiPartConfiguration.java",                                         line: 42,  text: "need to move it to the spring property" },
    { kind: "TODO",   path: "admin/broadleaf-contentmanagement-module/.../BroadleafProcessURLFilter.java",                                                   line: 499, text: "Multi-tenant: Need to add code that determines the site to support" },
    { kind: "TODO",   path: "admin/.../MapFieldsFieldMetadataProvider.java",                                                                                 line: 179, text: "support annotation override" },
    { kind: "TODO",   path: "admin/.../AdminUserDaoImpl.java",                                                                                               line: 99,  text: "rewrite on streams when upgraded to java 8" },
    { kind: "TODO",   path: "admin/.../FieldPathBuilder.java",                                                                                               line: 134, text: "this code should work, but there still appear to be bugs in Hibernate's JPA criteria handling for lists" },
    { kind: "TODO",   path: "admin/.../FormBuilderServiceImpl.java",                                                                                         line: 414, text: '9/27/2022 remove "if (field != null)" or move up before "field.getMetadata()"' },
  ],
  confidence_summary: { overall: "medium", stack: "high", entry_points: "high" },
  analysis_gaps: [
    { area: "api_contract", reason: "No OpenAPI/Swagger contract detected — agents cannot auto-discover API surface without it", impact: "medium" },
  ],
  language_version: "17",
  deployment: { packaging: "pom" },
  transactional_boundaries: {
    count: 29,
    classes: ["OrderMultishipOptionDaoImpl","OrderItemDaoImpl","OrderDaoImpl","OrderServiceImpl","FulfillmentGroupServiceImpl","FulfillmentOptionServiceImpl","OfferServiceImpl","OfferAuditServiceImpl","RatingServiceImpl","CodeTypeServiceImpl"],
    truncated: true,
    note: "showing 10 of 29; use --full to see all 29",
  },
  spring_profiles: { detected: ["default"] },
};

/* ════════════════════════════════════════════ SHARED ATOMS ══ */

function Chevron({ open }) {
  return (
    <svg
      className={cn("w-3 h-3 transition-transform duration-200 flex-shrink-0", open && "rotate-90")}
      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}
    >
      <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MethodBadge({ method }) {
  const styles = {
    GET:    "text-[#3dd68c] bg-[#3dd68c]/10 border-[#3dd68c]/20",
    POST:   "text-[#93c5fd] bg-[#93c5fd]/10 border-[#93c5fd]/20",
    PUT:    "text-[#fcd34d] bg-[#fcd34d]/10 border-[#fcd34d]/20",
    DELETE: "text-[#ff5f57] bg-[#ff5f57]/10 border-[#ff5f57]/20",
    PATCH:  "text-[#c4b5fd] bg-[#c4b5fd]/10 border-[#c4b5fd]/20",
  };
  return (
    <span className={cn(
      "inline-flex items-center justify-center text-[10px] font-bold px-1.5 py-0.5 rounded border w-[42px] flex-shrink-0",
      styles[method] ?? "text-[#888] bg-white/5 border-white/10"
    )}>
      {method}
    </span>
  );
}

function RoleBadge({ role }) {
  const styles = {
    controller:  "text-[#c4b5fd] bg-[#c4b5fd]/10",
    service:     "text-[#93c5fd] bg-[#93c5fd]/10",
    repository:  "text-[#fcd34d] bg-[#fcd34d]/10",
    infrastructure: "text-[#888] bg-white/5",
  };
  return (
    <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-mono", styles[role] ?? "text-[#888] bg-white/5")}>
      {role}
    </span>
  );
}

function FQNLine({ fqn }) {
  const { pkg, cls } = splitFQN(fqn);
  return (
    <div className="font-mono text-[11px] py-[1px] leading-relaxed min-w-0 break-all">
      {pkg && <span className="text-[#444]">{pkg}.</span>}
      <span className="text-[#ededed]">{cls}</span>
    </div>
  );
}

function KV({ k, v, vClass = "text-[#3dd68c]" }) {
  return (
    <div className="flex items-start gap-3 text-[11px] font-mono py-[1px]">
      <span className="text-[#444] flex-shrink-0 w-28">{k}</span>
      <span className={vClass}>{v}</span>
    </div>
  );
}

/* Accordion section — smooth height animation via CSS grid trick */
function Section({ title, badge, badgeClass, count, note, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-white/[0.06]">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-4 py-2.5 text-left hover:bg-white/[0.02] transition-colors group"
      >
        <span className="text-[#444] group-hover:text-[#888] transition-colors">
          <Chevron open={open} />
        </span>
        <span className="text-[10px] font-mono font-medium text-[#888] uppercase tracking-widest group-hover:text-[#aaa] transition-colors">
          {title}
        </span>
        {count !== undefined && (
          <span className="text-[10px] font-mono text-[#444] ml-0.5">{count}</span>
        )}
        {badge && (
          <span className={cn("ml-auto text-[10px] font-mono font-bold px-2 py-0.5 rounded border", badgeClass)}>
            {badge}
          </span>
        )}
        {!badge && note && (
          <span className="ml-auto text-[10px] font-mono text-[#444]">{note}</span>
        )}
      </button>
      {/* CSS grid accordion — no JS height measurement needed */}
      <div className={cn("grid transition-all duration-200", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
        <div className="overflow-hidden">
          <div className="px-4 pb-4 pt-0.5">{children}</div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════ IMPACT OUTPUT ══ */

function ImpactOutput() {
  const d = IMPACT;
  const maxSymbols = Math.max(...d.cross_module_impact.map(m => m.affected_symbol_count));

  return (
    <div>
      {/* Execution status */}
      <div className="px-4 py-2 flex items-center gap-2 font-mono text-[11px] border-t border-white/[0.06]">
        <span className="text-[#3dd68c]">✓</span>
        <span className="text-[#3dd68c]">done (5.0s)</span>
        <span className="text-[#444] ml-auto">
          depth={d.depth_reached} · bfs_truncated={String(d.bfs_truncated)}
        </span>
      </div>

      {/* ── Summary ── */}
      <Section title="Summary" defaultOpen>
        <div className="space-y-1">
          <KV k="target"     v={d.target}     vClass="text-[#fcd34d] font-bold" />
          <KV k="resolution" v={d.resolution} vClass="text-[#3dd68c]" />
          <KV k="matched"    v={<FQNLine fqn={d.matched_fqns[0]} />} />
        </div>
        <div className="mt-3 px-3 py-2.5 bg-[#111] rounded border border-white/[0.06] font-mono text-[11px] text-[#888] leading-relaxed">
          {d.explanation}
        </div>
      </Section>

      {/* ── Risk Assessment ── */}
      <Section
        title="Risk Assessment"
        badge={`${d.risk_level.toUpperCase()}`}
        badgeClass="text-[#ff5f57] bg-[#ff5f57]/10 border-[#ff5f57]/20"
        defaultOpen
      >
        <div className="flex gap-3">
          {/* Big score card */}
          <div className="flex flex-col items-center justify-center bg-[#ff5f57]/10 border border-[#ff5f57]/20 rounded-lg px-5 py-3 min-w-[88px]">
            <span className="text-[36px] font-bold font-mono text-[#ff5f57] leading-none">{d.risk_score}</span>
            <span className="text-[9px] text-[#ff5f57]/50 mt-1.5 uppercase tracking-widest">risk score</span>
          </div>
          {/* Stat grid */}
          <div className="grid grid-cols-3 gap-1.5 flex-1">
            {[
              { label: "direct callers",   value: d.stats.direct_caller_count,         color: "text-[#fcd34d]" },
              { label: "indirect callers", value: d.stats.indirect_caller_count,        color: "text-[#fcd34d]" },
              { label: "endpoints",        value: d.stats.endpoints_affected_count,     color: "text-[#6ee7f7]" },
              { label: "mappers",          value: d.stats.mappers_affected_count,        color: "text-[#888]"    },
              { label: "modules",          value: d.stats.modules_affected_count,        color: "text-[#93c5fd]" },
              { label: "confidence",       value: `${d.confidence_score * 100}%`,        color: "text-[#3dd68c]" },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex flex-col bg-[#111] rounded p-2 border border-white/[0.06]">
                <span className={cn("text-sm font-bold font-mono leading-none", color)}>{value}</span>
                <span className="text-[9px] text-[#444] mt-1.5 leading-none">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Direct Callers ── */}
      <Section title="Direct Callers" count={`${d.direct_callers.length}/${d.stats.direct_caller_count}`} defaultOpen>
        <div className="columns-1 space-y-0">
          {d.direct_callers.map((c, i) => <FQNLine key={i} fqn={c} />)}
        </div>
        <p className="mt-2 text-[10px] font-mono text-[#444] italic">{d.direct_callers_note}</p>
      </Section>

      {/* ── Indirect Callers ── */}
      <Section title="Indirect Callers" count={`${d.indirect_callers.length}/${d.stats.indirect_caller_count}`} defaultOpen={false}>
        <div className="space-y-0">
          {d.indirect_callers.map((c, i) => <FQNLine key={i} fqn={c} />)}
        </div>
        <p className="mt-2 text-[10px] font-mono text-[#444] italic">{d.indirect_callers_note}</p>
      </Section>

      {/* ── Endpoints Affected ── */}
      <Section title="Endpoints Affected" count={d.endpoints_affected.length} defaultOpen>
        <div className="space-y-1.5">
          {d.endpoints_affected.map((ep, i) => (
            <div key={i} className="flex items-start gap-2.5 py-1.5 border-b border-white/[0.04] last:border-0">
              <MethodBadge method={ep.method} />
              <div className="min-w-0 flex-1">
                <div className="font-mono text-[11px] text-[#ededed] break-all">{ep.path}</div>
                <div className="font-mono text-[10px] text-[#444] mt-0.5">
                  <span className="text-[#888]">{ep.handler}</span>
                  <span className="mx-1">·</span>
                  <span>{ep.cls}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Cross-Module Impact ── */}
      <Section title="Cross-Module Impact" count={d.cross_module_impact.length} defaultOpen>
        <div className="space-y-3">
          {d.cross_module_impact.map(m => (
            <div key={m.module}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-[11px] text-[#ededed]">{m.module}</span>
                <span className="font-mono text-[11px] font-bold text-[#6ee7f7]">{m.affected_symbol_count} symbols</span>
              </div>
              <div className="h-[3px] bg-white/[0.06] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#6ee7f7] rounded-full transition-all duration-500"
                  style={{ width: `${(m.affected_symbol_count / maxSymbols) * 100}%`, opacity: 0.5 }}
                />
              </div>
              <div className="font-mono text-[9px] text-[#444] mt-0.5">{m.package_prefix}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Persistence / Mappers ── */}
      <Section title="Persistence / Mappers" count={`${d.mappers_affected.length}/${d.stats.mappers_affected_count}`} defaultOpen={false}>
        <div className="space-y-1">
          {d.mappers_affected.map((m, i) => (
            <div key={i} className="flex items-center gap-2">
              <RoleBadge role={m.role} />
              <FQNLine fqn={m.fqn} />
            </div>
          ))}
        </div>
      </Section>

      {/* ── Raw JSON ── */}
      <Section title="Raw JSON" defaultOpen={false}>
        <pre className="text-[10px] font-mono text-[#555] overflow-x-auto max-h-72 overflow-y-auto leading-relaxed bg-[#0a0a0a] rounded border border-white/[0.06] p-3 scrollbar-thin">
          {JSON.stringify(IMPACT, null, 2)}
        </pre>
      </Section>
    </div>
  );
}

/* ════════════════════════════════════════════ ONBOARD OUTPUT ══ */

function OnboardOutput() {
  const d = ONBOARD;
  return (
    <div>
      {/* Run metadata */}
      <div className="px-4 py-2 flex items-center gap-3 font-mono text-[11px] border-t border-white/[0.06]">
        <span className="text-[#3dd68c]">✓</span>
        <span className="text-[#3dd68c]">task: onboard</span>
        <span className="text-[#444]">run_id: {d.run_id}</span>
        <span className={cn(
          "ml-auto text-[9px] px-2 py-0.5 rounded border font-bold",
          d.confidence === "high" ? "text-[#3dd68c] bg-[#3dd68c]/10 border-[#3dd68c]/20" : "text-[#fcd34d] bg-[#fcd34d]/10 border-[#fcd34d]/20"
        )}>
          confidence: {d.confidence}
        </span>
      </div>

      {/* ── Project Summary ── */}
      <Section title="Project Summary" defaultOpen>
        <p className="font-mono text-[11px] text-[#888] leading-relaxed">{d.project_summary}</p>
      </Section>

      {/* ── Architecture ── */}
      <Section title="Architecture" defaultOpen>
        {d.architecture_summary.split("\n").map((line, i) => (
          <p key={i} className="font-mono text-[11px] text-[#888] leading-relaxed">{line}</p>
        ))}
      </Section>

      {/* ── Entry Points ── */}
      <Section title="Entry Points" defaultOpen>
        <div className="space-y-4">
          {/* Controllers summary */}
          <div className="flex items-center gap-3 p-3 bg-[#111] rounded border border-white/[0.06]">
            <div className="text-center">
              <div className="text-2xl font-bold font-mono text-[#6ee7f7]">{d.entry_points.controllers.classes}</div>
              <div className="text-[9px] text-[#444] uppercase tracking-wider mt-0.5">controllers</div>
            </div>
            <div className="w-px h-10 bg-white/[0.06]" />
            <div className="text-center">
              <div className="text-2xl font-bold font-mono text-[#93c5fd]">{d.entry_points.controllers.methods}</div>
              <div className="text-[9px] text-[#444] uppercase tracking-wider mt-0.5">methods</div>
            </div>
            <div className="w-px h-10 bg-white/[0.06]" />
            <div className="flex flex-wrap gap-1 flex-1">
              {d.entry_points.controllers.modules.map(m => (
                <span key={m} className="text-[9px] font-mono px-1.5 py-0.5 bg-[#93c5fd]/10 text-[#93c5fd] rounded">{m}</span>
              ))}
            </div>
          </div>
          {/* Security filters */}
          <div>
            <p className="text-[9px] font-mono text-[#444] uppercase tracking-widest mb-1.5">security filters</p>
            {d.entry_points.security.map((f, i) => (
              <div key={i} className="font-mono text-[10px] text-[#444] py-[1px] truncate hover:text-[#888] transition-colors" title={f}>
                {f.split("/").pop()}
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Transactional Boundaries ── */}
      <Section title="Transactional Boundaries" count={`${d.transactional_boundaries.count} total`} defaultOpen>
        <div className="grid grid-cols-2 gap-1">
          {d.transactional_boundaries.classes.map((cls, i) => (
            <div key={i} className="font-mono text-[10px] text-[#fcd34d] py-[1px]">{cls}</div>
          ))}
        </div>
        {d.transactional_boundaries.truncated && (
          <p className="mt-2 text-[10px] font-mono text-[#444] italic">{d.transactional_boundaries.note}</p>
        )}
      </Section>

      {/* ── Relevant Files ── */}
      <Section title="Relevant Files" count={`${d.relevant_files.length} shown`} defaultOpen={false}>
        <div className="space-y-2">
          {d.relevant_files.map((f, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className={cn(
                "flex-shrink-0 text-[9px] px-1.5 py-0.5 rounded font-mono mt-[1px]",
                f.role === "entrypoint" ? "text-[#6ee7f7] bg-[#6ee7f7]/10" : "text-[#888] bg-white/5"
              )}>{f.role}</span>
              <div className="min-w-0">
                <div className="font-mono text-[10px] text-[#ededed] break-all">{f.path.split("/").pop()}</div>
                <div className="font-mono text-[9px] text-[#444] mt-0.5">{f.explanation}</div>
              </div>
              <span className="flex-shrink-0 font-mono text-[10px] text-[#3dd68c] ml-auto">{f.score.toFixed(1)}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Gaps ── */}
      <Section title="Gaps" badge={`${d.gaps.length}`} badgeClass="text-[#fcd34d] bg-[#fcd34d]/10 border-[#fcd34d]/20" defaultOpen>
        <div className="space-y-1.5">
          {d.gaps.map((g, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-[#fcd34d] text-[11px] flex-shrink-0 mt-[1px]">⚠</span>
              <p className="font-mono text-[11px] text-[#888] leading-relaxed">{g}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Raw JSON ── */}
      <Section title="Raw JSON" defaultOpen={false}>
        <pre className="text-[10px] font-mono text-[#555] overflow-x-auto max-h-72 overflow-y-auto leading-relaxed bg-[#0a0a0a] rounded border border-white/[0.06] p-3">
          {JSON.stringify(ONBOARD, null, 2)}
        </pre>
      </Section>
    </div>
  );
}

/* ════════════════════════════════════════════ COMPACT OUTPUT ══ */

const NOTE_META = {
  BUG:      { icon: "🐛", color: "text-[#ff5f57] bg-[#ff5f57]/10 border-[#ff5f57]/20" },
  FIXME:    { icon: "🔧", color: "text-[#fcd34d] bg-[#fcd34d]/10 border-[#fcd34d]/20" },
  TODO:     { icon: "○",  color: "text-[#888]    bg-white/5       border-white/[0.08]" },
  NOTE:     { icon: "◆",  color: "text-[#93c5fd] bg-[#93c5fd]/10 border-[#93c5fd]/20" },
  OPTIMIZE: { icon: "⚡", color: "text-[#c4b5fd] bg-[#c4b5fd]/10 border-[#c4b5fd]/20" },
};

function CompactOutput() {
  const d = COMPACT;
  const { by_kind } = d.code_notes_summary;

  return (
    <div>
      <div className="px-4 py-2 flex items-center gap-2 font-mono text-[11px] border-t border-white/[0.06]">
        <span className="text-[#3dd68c]">✓</span>
        <span className="text-[#3dd68c]">schema_version: {d.schema_version}</span>
        <span className={cn(
          "ml-auto text-[9px] px-2 py-0.5 rounded border font-bold",
          "text-[#fcd34d] bg-[#fcd34d]/10 border-[#fcd34d]/20"
        )}>
          confidence: {d.confidence_summary.overall}
        </span>
      </div>

      {/* ── Project Summary ── */}
      <Section title="Project Summary" defaultOpen>
        <p className="font-mono text-[11px] text-[#888] leading-relaxed">{d.project_summary}</p>
      </Section>

      {/* ── Architecture & Stacks ── */}
      <Section title="Architecture & Stacks" defaultOpen>
        {d.architecture_summary.split("\n").map((line, i) => (
          <p key={i} className="font-mono text-[11px] text-[#888] leading-relaxed">{line}</p>
        ))}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {d.stacks[0].frameworks.map(fw => (
            <span key={fw} className="text-[9px] font-mono px-2 py-0.5 bg-[#6ee7f7]/5 border border-[#6ee7f7]/15 text-[#6ee7f7] rounded">
              {fw}
            </span>
          ))}
          <span className="text-[9px] font-mono px-2 py-0.5 bg-white/5 border border-white/[0.08] text-[#888] rounded">
            Java {d.language_version}
          </span>
          <span className="text-[9px] font-mono px-2 py-0.5 bg-white/5 border border-white/[0.08] text-[#888] rounded">
            maven
          </span>
        </div>
      </Section>

      {/* ── Entry Points ── */}
      <Section title="Entry Points" defaultOpen>
        <div className="flex items-center gap-4 mb-3">
          <div>
            <span className="font-mono text-xl font-bold text-[#6ee7f7]">{d.entry_points.controllers.classes}</span>
            <span className="font-mono text-[10px] text-[#444] ml-1.5">controller classes</span>
          </div>
          <div className="w-px h-6 bg-white/[0.06]" />
          <div>
            <span className="font-mono text-xl font-bold text-[#93c5fd]">{d.entry_points.security.length}</span>
            <span className="font-mono text-[10px] text-[#444] ml-1.5">security filters</span>
          </div>
        </div>
        {d.entry_points.security.slice(0, 4).map((f, i) => (
          <div key={i} className="font-mono text-[10px] text-[#444] py-[1px] truncate">{f.split("/").pop()}</div>
        ))}
        {d.entry_points.security.length > 4 && (
          <div className="font-mono text-[10px] text-[#444] py-[1px]">+{d.entry_points.security.length - 4} more</div>
        )}
      </Section>

      {/* ── Dependency Summary ── */}
      <Section title="Dependencies" count={`${d.dependency_summary.total_count} direct`} defaultOpen>
        <div className="flex items-center gap-3 mb-3">
          <div className="text-2xl font-bold font-mono text-[#fcd34d]">{d.dependency_summary.total_count}</div>
          <div>
            <div className="font-mono text-[10px] text-[#888]">total direct dependencies</div>
            <div className="font-mono text-[10px] text-[#444]">sources: {d.dependency_summary.sources.join(", ")}</div>
          </div>
        </div>
      </Section>

      {/* ── Code Notes ── */}
      <Section title="Code Notes" count={d.code_notes_summary.total} defaultOpen>
        {/* Summary badges */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {Object.entries(by_kind).map(([kind, count]) => {
            const meta = NOTE_META[kind] ?? { icon: "·", color: "text-[#888] bg-white/5 border-white/[0.08]" };
            return (
              <span key={kind} className={cn("text-[10px] font-mono font-bold px-2 py-1 rounded border inline-flex items-center gap-1", meta.color)}>
                <span>{meta.icon}</span>
                <span>{kind}</span>
                <span className="opacity-60">×{count}</span>
              </span>
            );
          })}
        </div>
        {/* Individual notes */}
        <div className="space-y-2">
          {d.code_notes.map((n, i) => {
            const meta = NOTE_META[n.kind] ?? { icon: "·", color: "text-[#888] bg-white/5 border-white/[0.08]" };
            return (
              <div key={i} className="flex items-start gap-2">
                <span className={cn("flex-shrink-0 text-[9px] px-1.5 py-0.5 rounded border font-mono font-bold mt-[1px]", meta.color)}>
                  {n.kind}
                </span>
                <div className="min-w-0">
                  <div className="font-mono text-[10px] text-[#ededed] break-all">{n.path.split("/").pop()}<span className="text-[#444]">:{n.line}</span></div>
                  <div className="font-mono text-[10px] text-[#555] mt-0.5">{n.text}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* ── Key Dependencies ── */}
      <Section title="Key Dependencies" count={d.key_dependencies.length} defaultOpen={false}>
        <div className="grid grid-cols-1 gap-0.5">
          {d.key_dependencies.map((dep, i) => {
            const [group, artifact] = dep.split(":");
            return (
              <div key={i} className="font-mono text-[10px] py-[1px]">
                <span className="text-[#444]">{group}:</span>
                <span className="text-[#ededed]">{artifact}</span>
              </div>
            );
          })}
        </div>
      </Section>

      {/* ── Transactional Boundaries ── */}
      <Section title="Transactional Boundaries" count={`${d.transactional_boundaries.count} total`} defaultOpen={false}>
        <div className="grid grid-cols-2 gap-1">
          {d.transactional_boundaries.classes.map((cls, i) => (
            <div key={i} className="font-mono text-[10px] text-[#fcd34d]">{cls}</div>
          ))}
        </div>
        <p className="mt-2 text-[10px] font-mono text-[#444] italic">{d.transactional_boundaries.note}</p>
        {d.analysis_gaps.map((gap, i) => (
          <div key={i} className="flex items-start gap-2 mt-2">
            <span className="text-[#fcd34d] text-[11px] flex-shrink-0">⚠</span>
            <p className="font-mono text-[10px] text-[#555]">{gap.reason}</p>
          </div>
        ))}
      </Section>

      {/* ── Raw JSON ── */}
      <Section title="Raw JSON" defaultOpen={false}>
        <pre className="text-[10px] font-mono text-[#555] overflow-x-auto max-h-72 overflow-y-auto leading-relaxed bg-[#0a0a0a] rounded border border-white/[0.06] p-3">
          {JSON.stringify(COMPACT, null, 2)}
        </pre>
      </Section>
    </div>
  );
}

/* ════════════════════════════════════════════ MAIN COMPONENT ══ */

export default function TerminalOutputDemo() {
  const [expanded, setExpanded] = useState(false);
  const [activeCmd, setActiveCmd] = useState(0);

  return (
    <div
      className="w-full max-w-[760px] mx-auto"
      style={{ fontFamily: "'JetBrains Mono', monospace" }}
    >
      {!expanded ? (
        /* ══ COLLAPSED STATE ══════════════════════════════════════ */
        <button
          onClick={() => setExpanded(true)}
          className="w-full text-left group"
          aria-label="Expand terminal output demo"
        >
          <div className="bg-[#0a0a0a] border border-white/[0.07] rounded-[10px] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.025)] transition-all duration-200 hover:border-[#6ee7f7]/20 hover:shadow-[0_32px_80px_rgba(0,0,0,0.8),0_0_0_1px_rgba(110,231,247,0.08)]">
            {/* Traffic lights bar */}
            <div className="flex items-center gap-1.5 px-4 py-3 bg-[#111] border-b border-white/[0.06]">
              <span className="w-[11px] h-[11px] rounded-full bg-[#ff5f57]" />
              <span className="w-[11px] h-[11px] rounded-full bg-[#febc2e]" />
              <span className="w-[11px] h-[11px] rounded-full bg-[#28c840]" />
              <span className="ml-2 text-[11px] text-[#444] tracking-wide">bash · ~/projects/broadleaf-commerce</span>
            </div>
            {/* Prompt line */}
            <div className="px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[#6ee7f7] opacity-60">❯</span>
                <span className="text-[#ededed] text-[13px]">{COMMANDS[activeCmd].cmd}</span>
                <span
                  className="inline-block w-[7px] h-[14px] bg-[#6ee7f7] opacity-75 ml-0.5 align-middle"
                  style={{ animation: "sc-blink 1.2s step-end infinite" }}
                />
              </div>
              <span className="text-[10px] text-[#444] group-hover:text-[#888] transition-colors tracking-wider">
                ↵ click to run
              </span>
            </div>
          </div>
          {/* Blink keyframe — injected inline to avoid external stylesheet dependency */}
          <style>{`@keyframes sc-blink{0%,100%{opacity:0.75}50%{opacity:0}}`}</style>
        </button>
      ) : (
        /* ══ EXPANDED STATE ═══════════════════════════════════════ */
        <div className="bg-[#0a0a0a] border border-white/[0.07] rounded-[10px] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.025)]">
          {/* ── Title bar + command tabs ── */}
          <div className="flex items-center gap-0 px-4 py-3 bg-[#111] border-b border-white/[0.06]">
            {/* Traffic lights */}
            <div className="flex items-center gap-1.5 mr-4 flex-shrink-0">
              <button
                onClick={() => setExpanded(false)}
                className="w-[11px] h-[11px] rounded-full bg-[#ff5f57] hover:brightness-125 transition-all"
                aria-label="Close"
                title="Close"
              />
              <span className="w-[11px] h-[11px] rounded-full bg-[#febc2e]" />
              <span className="w-[11px] h-[11px] rounded-full bg-[#28c840]" />
            </div>
            {/* Command tabs */}
            <div className="flex items-center gap-0.5 flex-1 overflow-x-auto">
              {COMMANDS.map((c, i) => (
                <button
                  key={c.id}
                  onClick={() => setActiveCmd(i)}
                  className={cn(
                    "px-3 py-1 text-[11px] rounded-md transition-all whitespace-nowrap",
                    activeCmd === i
                      ? "bg-[#0a0a0a] text-[#ededed] shadow-sm"
                      : "text-[#444] hover:text-[#888]"
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Terminal content ── */}
          <div className="max-h-[640px] overflow-y-auto overflow-x-hidden">
            {/* Active command prompt line */}
            <div className="px-4 py-2.5 flex items-center gap-2 font-mono text-[13px]">
              <span className="text-[#6ee7f7] opacity-60">❯</span>
              <span className="text-[#ededed]">{COMMANDS[activeCmd].cmd}</span>
            </div>

            {/* Output for active command */}
            {activeCmd === 0 && <ImpactOutput />}
            {activeCmd === 1 && <OnboardOutput />}
            {activeCmd === 2 && <CompactOutput />}

            {/* Bottom padding */}
            <div className="h-4" />
          </div>
        </div>
      )}
    </div>
  );
}
