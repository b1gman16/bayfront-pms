module.exports = [
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/src/app/(app)/front-desk/[id]/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Bill,
    "dynamic",
    ()=>dynamic
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-auth/index.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$api$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/api/navigation.react-server.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/components/navigation.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/server/db.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/server/auth.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$domain$2f$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/server/domain/permissions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$domain$2f$folio$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/server/domain/folio.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$services$2f$reservations$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/server/services/reservations.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$FolioActions$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/FolioActions.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$StatusBadge$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/StatusBadge.tsx [app-rsc] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
const dynamic = "force-dynamic";
const card = "rounded-xl border border-slate-200 bg-white p-5 shadow-sm";
const dt = (d)=>d.toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC"
    });
async function Bill(props) {
    const { id } = await props.params;
    const user = (await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getServerSession"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authOptions"]))?.user;
    const r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].reservation.findUnique({
        where: {
            id
        },
        include: {
            guest: true,
            room: true,
            folio: true
        }
    });
    if (!r || !r.folio) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["notFound"])();
    const { folio, totals: t } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$services$2f$reservations$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getFolioTotals"])(r.folio.id);
    const open = r.status === "CHECKED_IN" && !folio.closedAt;
    const row = (l, v, bold = false)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: `flex justify-between py-1 ${bold ? "border-t border-slate-200 pt-2 font-semibold" : ""}`,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    children: l
                }, void 0, false, {
                    fileName: "[project]/src/app/(app)/front-desk/[id]/page.tsx",
                    lineNumber: 21,
                    columnNumber: 162
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    children: v
                }, void 0, false, {
                    fileName: "[project]/src/app/(app)/front-desk/[id]/page.tsx",
                    lineNumber: 21,
                    columnNumber: 178
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/(app)/front-desk/[id]/page.tsx",
            lineNumber: 21,
            columnNumber: 55
        }, this);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-5",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "text-2xl font-semibold",
                                children: r.guest.fullName
                            }, void 0, false, {
                                fileName: "[project]/src/app/(app)/front-desk/[id]/page.tsx",
                                lineNumber: 23,
                                columnNumber: 61
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-slate-500",
                                children: [
                                    r.code,
                                    " · Room ",
                                    r.room?.number,
                                    " · ",
                                    dt(r.checkIn),
                                    " to ",
                                    dt(r.checkOut)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(app)/front-desk/[id]/page.tsx",
                                lineNumber: 24,
                                columnNumber: 7
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(app)/front-desk/[id]/page.tsx",
                        lineNumber: 23,
                        columnNumber: 56
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$StatusBadge$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                        status: r.status
                    }, void 0, false, {
                        fileName: "[project]/src/app/(app)/front-desk/[id]/page.tsx",
                        lineNumber: 24,
                        columnNumber: 125
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(app)/front-desk/[id]/page.tsx",
                lineNumber: 23,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid gap-4 lg:grid-cols-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: card,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "mb-2 font-semibold",
                                children: "Charges"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(app)/front-desk/[id]/page.tsx",
                                lineNumber: 26,
                                columnNumber: 33
                            }, this),
                            folio.items.filter((i)=>!i.voidedAt).map((i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex justify-between border-t border-slate-100 py-2 text-sm first:border-0",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: [
                                                i.description,
                                                i.qty > 1 ? ` × ${i.qty}` : ""
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(app)/front-desk/[id]/page.tsx",
                                            lineNumber: 27,
                                            columnNumber: 159
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$domain$2f$folio$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["formatPHP"])(i.qty * i.unitAmount)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(app)/front-desk/[id]/page.tsx",
                                            lineNumber: 27,
                                            columnNumber: 219
                                        }, this)
                                    ]
                                }, i.id, true, {
                                    fileName: "[project]/src/app/(app)/front-desk/[id]/page.tsx",
                                    lineNumber: 27,
                                    columnNumber: 56
                                }, this)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-2 text-sm",
                                children: [
                                    row("Subtotal", (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$domain$2f$folio$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["formatPHP"])(t.subtotal), true),
                                    t.breakdown.map((b)=>row(b.name, (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$domain$2f$folio$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["formatPHP"])(b.amount))),
                                    row("Total", (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$domain$2f$folio$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["formatPHP"])(t.total), true)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(app)/front-desk/[id]/page.tsx",
                                lineNumber: 28,
                                columnNumber: 9
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(app)/front-desk/[id]/page.tsx",
                        lineNumber: 26,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: card,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "mb-2 font-semibold",
                                children: "Payments"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(app)/front-desk/[id]/page.tsx",
                                lineNumber: 29,
                                columnNumber: 33
                            }, this),
                            folio.payments.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "py-2 text-sm text-slate-500",
                                children: "No payments yet."
                            }, void 0, false, {
                                fileName: "[project]/src/app/(app)/front-desk/[id]/page.tsx",
                                lineNumber: 30,
                                columnNumber: 40
                            }, this) : folio.payments.map((p)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex justify-between border-t border-slate-100 py-2 text-sm first:border-0",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: [
                                                p.method,
                                                p.reference ? ` (${p.reference})` : "",
                                                " · ",
                                                p.at.toLocaleString("en-PH", {
                                                    month: "short",
                                                    day: "numeric",
                                                    hour: "numeric",
                                                    minute: "2-digit",
                                                    timeZone: "Asia/Manila"
                                                })
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(app)/front-desk/[id]/page.tsx",
                                            lineNumber: 31,
                                            columnNumber: 11
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: [
                                                p.kind === "REFUND" ? "-" : "",
                                                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$domain$2f$folio$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["formatPHP"])(p.amount)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(app)/front-desk/[id]/page.tsx",
                                            lineNumber: 31,
                                            columnNumber: 204
                                        }, this)
                                    ]
                                }, p.id, true, {
                                    fileName: "[project]/src/app/(app)/front-desk/[id]/page.tsx",
                                    lineNumber: 30,
                                    columnNumber: 130
                                }, this)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-2 text-sm",
                                children: [
                                    row("Paid", (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$domain$2f$folio$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["formatPHP"])(t.paid - t.refunded)),
                                    row("Balance due", (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$domain$2f$folio$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["formatPHP"])(t.balance), true)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(app)/front-desk/[id]/page.tsx",
                                lineNumber: 32,
                                columnNumber: 9
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(app)/front-desk/[id]/page.tsx",
                        lineNumber: 29,
                        columnNumber: 7
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(app)/front-desk/[id]/page.tsx",
                lineNumber: 25,
                columnNumber: 5
            }, this),
            open ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$FolioActions$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                reservationId: r.id,
                folioId: folio.id,
                balance: t.balance,
                canOverride: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$domain$2f$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["can"])(user.role, "checkout.override")
            }, void 0, false, {
                fileName: "[project]/src/app/(app)/front-desk/[id]/page.tsx",
                lineNumber: 33,
                columnNumber: 13
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "rounded bg-slate-100 p-3 text-sm text-slate-600",
                children: [
                    "This folio is closed. Checked out ",
                    r.checkedOutAt?.toLocaleString("en-PH", {
                        timeZone: "Asia/Manila"
                    }),
                    "."
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(app)/front-desk/[id]/page.tsx",
                lineNumber: 34,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(app)/front-desk/[id]/page.tsx",
        lineNumber: 22,
        columnNumber: 11
    }, this);
}
}),
"[project]/src/app/(app)/front-desk/[id]/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", (function(__turbopack_context__){

__turbopack_context__.n(__turbopack_context__.i("[project]/src/app/(app)/front-desk/[id]/page.tsx [app-rsc] (ecmascript)"));
}),
"[project]/src/components/FolioActions.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call the default export of [project]/src/components/FolioActions.tsx from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/src/components/FolioActions.tsx", "default");
}),
"[project]/src/components/FolioActions.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call the default export of [project]/src/components/FolioActions.tsx <module evaluation> from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/src/components/FolioActions.tsx <module evaluation>", "default");
}),
"[project]/src/components/FolioActions.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$FolioActions$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/src/components/FolioActions.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$FolioActions$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/src/components/FolioActions.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$FolioActions$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/src/components/StatusBadge.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>StatusBadge
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
;
const tone = {
    CHECKED_IN: "bg-emerald-50 text-emerald-700",
    CONFIRMED: "bg-amber-50 text-amber-700",
    PENDING: "bg-amber-50 text-amber-700",
    CHECKED_OUT: "bg-slate-100 text-slate-600",
    CANCELLED: "bg-red-50 text-red-700",
    NO_SHOW: "bg-red-50 text-red-700",
    AVAILABLE: "bg-emerald-50 text-emerald-700",
    CLEAN: "bg-emerald-50 text-emerald-700",
    INSPECTED: "bg-emerald-50 text-emerald-700",
    RESERVED: "bg-amber-50 text-amber-700",
    OCCUPIED: "bg-blue-50 text-blue-700",
    DIRTY: "bg-orange-50 text-orange-700",
    CLEANING: "bg-orange-50 text-orange-700",
    MAINTENANCE: "bg-red-50 text-red-700",
    OUT_OF_ORDER: "bg-red-50 text-red-700"
};
const label = (s)=>s.replace(/_/g, " ").toLowerCase().replace(/^\w|\s\w/g, (c)=>c.toUpperCase());
function StatusBadge({ status }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: `rounded-full px-2.5 py-0.5 text-xs font-medium ${tone[status] ?? "bg-slate-100 text-slate-600"}`,
        children: label(status)
    }, void 0, false, {
        fileName: "[project]/src/components/StatusBadge.tsx",
        lineNumber: 9,
        columnNumber: 10
    }, this);
}
}),
"[project]/src/server/audit.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "audit",
    ()=>audit
]);
const audit = (tx, userId, action, entity, entityId, summary, before, after)=>tx.auditLog.create({
        data: {
            userId,
            action,
            entity,
            entityId,
            summary,
            before: before,
            after: after
        }
    });
}),
"[project]/src/server/domain/availability.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "findAvailableRooms",
    ()=>findAvailableRooms,
    "isRoomFree",
    ()=>isRoomFree,
    "nightsBetween",
    ()=>nightsBetween,
    "overlaps",
    ()=>overlaps
]);
const ACTIVE = [
    "PENDING",
    "CONFIRMED",
    "CHECKED_IN"
];
const BLOCKED = [
    "MAINTENANCE",
    "OUT_OF_ORDER"
];
const overlaps = (aIn, aOut, bIn, bOut)=>aIn < bOut && bIn < aOut;
function nightsBetween(checkIn, checkOut) {
    return Math.round((checkOut.getTime() - checkIn.getTime()) / 86_400_000);
}
function isRoomFree(room, stays, from, to, ignoreId) {
    if (to <= from) return false;
    if (BLOCKED.includes(room.status)) return false;
    return !stays.some((s)=>s.roomId === room.id && !(ignoreId && s.id === ignoreId) && ACTIVE.includes(s.status) && overlaps(s.checkIn, s.checkOut, from, to));
}
function findAvailableRooms(rooms, stays, from, to, roomTypeId, ignoreId) {
    return rooms.filter((r)=>(!roomTypeId || r.roomTypeId === roomTypeId) && isRoomFree(r, stays, from, to, ignoreId));
}
}),
"[project]/src/server/domain/folio.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "computeFolio",
    ()=>computeFolio,
    "formatPHP",
    ()=>formatPHP
]);
const amountOf = (r, base)=>Math.round(r.type === "PERCENT" ? base * r.value / 10_000 : r.value);
function computeFolio(lines, rules, payments) {
    const subtotal = lines.filter((l)=>!l.voided).reduce((s, l)=>s + l.qty * l.unitAmount, 0);
    const active = rules.filter((r)=>r.active).sort((a, b)=>(a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    const breakdown = [];
    let discounts = 0, fees = 0, taxes = 0;
    for (const r of active.filter((r)=>r.kind === "DISCOUNT")){
        const a = Math.min(amountOf(r, subtotal - discounts), subtotal - discounts);
        discounts += a;
        breakdown.push({
            name: r.name,
            kind: r.kind,
            amount: -a
        });
    }
    const net = subtotal - discounts;
    for (const r of active.filter((r)=>r.kind === "FEE")){
        const a = amountOf(r, net);
        fees += a;
        breakdown.push({
            name: r.name,
            kind: r.kind,
            amount: a
        });
    }
    for (const r of active.filter((r)=>r.kind === "TAX")){
        const a = amountOf(r, r.compound ? net + fees : net);
        taxes += a;
        breakdown.push({
            name: r.name,
            kind: r.kind,
            amount: a
        });
    }
    const total = net + fees + taxes;
    const paid = payments.filter((p)=>p.kind === "PAYMENT").reduce((s, p)=>s + p.amount, 0);
    const refunded = payments.filter((p)=>p.kind === "REFUND").reduce((s, p)=>s + p.amount, 0);
    return {
        subtotal,
        discounts,
        fees,
        taxes,
        total,
        paid,
        refunded,
        balance: total - (paid - refunded),
        breakdown
    };
}
const formatPHP = (centavos)=>new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP"
    }).format(centavos / 100);
}),
"[project]/src/server/domain/permissions.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PERMISSIONS",
    ()=>PERMISSIONS,
    "assertCan",
    ()=>assertCan,
    "can",
    ()=>can
]);
const FRONT = [
    "reservation.view",
    "reservation.create",
    "reservation.edit",
    "reservation.cancel",
    "guest.view",
    "guest.edit",
    "checkin",
    "checkout",
    "payment.record",
    "payment.view",
    "room.status",
    "room.view",
    "folio.view",
    "folio.charge",
    "housekeeping.view",
    "maintenance.report"
];
const PERMISSIONS = {
    OWNER: [
        "*"
    ],
    MANAGER: [
        ...FRONT,
        "payment.refund",
        "folio.void",
        "room.manage",
        "rate.manage",
        "report.view",
        "report.financial",
        "housekeeping.manage",
        "housekeeping.update",
        "maintenance.manage",
        "user.manage",
        "audit.view",
        "checkout.override"
    ],
    FRONT_DESK: FRONT,
    HOUSEKEEPING: [
        "room.view",
        "room.status.clean",
        "housekeeping.view",
        "housekeeping.update",
        "maintenance.report"
    ],
    CASHIER: [
        "payment.record",
        "payment.view",
        "payment.refund.request",
        "folio.view",
        "folio.charge",
        "reservation.view",
        "report.financial"
    ]
};
function can(role, permission) {
    const p = PERMISSIONS[role];
    return p.includes("*") || p.includes(permission);
}
function assertCan(role, permission) {
    if (!can(role, permission)) throw new Error(`Forbidden: ${permission}`);
}
}),
"[project]/src/server/http.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AppError",
    ()=>AppError,
    "api",
    ()=>api
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-auth/index.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$ZodError$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zod/v3/ZodError.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/server/auth.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$domain$2f$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/server/domain/permissions.ts [app-rsc] (ecmascript)");
;
;
;
;
;
class AppError extends Error {
    status;
    data;
    constructor(message, status = 409, data){
        super(message), this.status = status, this.data = data;
    }
}
function api(permission, fn) {
    return async (req, ctx)=>{
        try {
            const u = (await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getServerSession"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authOptions"]))?.user;
            if (!u) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Not signed in"
            }, {
                status: 401
            });
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$domain$2f$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["can"])(u.role, permission)) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Not allowed"
            }, {
                status: 403
            });
            const params = ctx?.params ? await ctx.params : {}; // Next 14 gives an object, Next 15+ a Promise
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["NextResponse"].json(await fn(req, {
                id: u.id,
                name: u.name,
                role: u.role
            }, {
                ...ctx,
                params
            }));
        } catch (e) {
            if (e instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$ZodError$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ZodError"]) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Invalid input",
                details: e.flatten()
            }, {
                status: 400
            });
            if (e instanceof AppError) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: e.message,
                data: e.data
            }, {
                status: e.status
            });
            console.error(e);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Something went wrong"
            }, {
                status: 500
            });
        }
    };
}
}),
"[project]/src/server/services/reservations.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "checkIn",
    ()=>checkIn,
    "checkOut",
    ()=>checkOut,
    "createReservation",
    ()=>createReservation,
    "createSchema",
    ()=>createSchema,
    "getFolioTotals",
    ()=>getFolioTotals,
    "paymentSchema",
    ()=>paymentSchema,
    "recordPayment",
    ()=>recordPayment
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v3/external.js [app-rsc] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/server/db.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$audit$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/server/audit.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$http$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/server/http.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$domain$2f$availability$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/server/domain/availability.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$domain$2f$folio$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/server/domain/folio.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$domain$2f$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/server/domain/permissions.ts [app-rsc] (ecmascript)");
;
;
;
;
;
;
;
const day = (s)=>new Date(s + "T00:00:00.000Z");
const createSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    guestId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
    roomTypeId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
    roomId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    checkIn: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().regex(/^\d{4}-\d{2}-\d{2}$/),
    checkOut: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().regex(/^\d{4}-\d{2}-\d{2}$/),
    adults: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().min(1),
    children: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().min(0).default(0),
    source: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().default("WALK_IN"),
    specialRequests: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional()
});
async function createReservation(raw, actor) {
    const d = createSchema.parse(raw);
    const from = day(d.checkIn), to = day(d.checkOut);
    if (to <= from) throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$http$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AppError"]("Check-out must be after check-in", 400);
    try {
        return await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].$transaction(async (tx)=>{
            const type = await tx.roomType.findUniqueOrThrow({
                where: {
                    id: d.roomTypeId
                }
            });
            if (d.adults + d.children > type.maxOccupancy) throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$http$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AppError"](`Max ${type.maxOccupancy} guests for ${type.name}`, 400);
            if (d.roomId) {
                const room = await tx.room.findUniqueOrThrow({
                    where: {
                        id: d.roomId
                    }
                });
                const stays = await tx.reservation.findMany({
                    where: {
                        roomId: room.id
                    }
                });
                if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$domain$2f$availability$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isRoomFree"])(room, stays, from, to)) throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$http$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AppError"](`Room ${room.number} is not available for those dates`);
            }
            const last = await tx.reservation.aggregate({
                _count: true
            });
            const code = `BR-${1000 + last._count + 1}`;
            const r = await tx.reservation.create({
                data: {
                    code,
                    guestId: d.guestId,
                    roomTypeId: d.roomTypeId,
                    roomId: d.roomId,
                    checkIn: from,
                    checkOut: to,
                    adults: d.adults,
                    children: d.children,
                    source: d.source,
                    specialRequests: d.specialRequests,
                    ratePerNight: type.baseRate,
                    status: "CONFIRMED",
                    createdById: actor.id
                }
            });
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$audit$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["audit"])(tx, actor.id, "reservation.create", "Reservation", r.id, `${actor.name} created ${code}`, undefined, r);
            return r;
        });
    } catch (e) {
        if (String(e?.message).includes("no_double_booking")) throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$http$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AppError"]("That room was just booked by someone else. Pick another.");
        throw e;
    }
}
async function checkIn(id, version, override, actor) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].$transaction(async (tx)=>{
        const r = await tx.reservation.findUniqueOrThrow({
            where: {
                id
            },
            include: {
                room: true
            }
        });
        if (![
            "PENDING",
            "CONFIRMED"
        ].includes(r.status)) throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$http$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AppError"](`Reservation is ${r.status}, cannot check in`);
        if (!r.room) throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$http$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AppError"]("Assign a room before check-in", 400);
        if (![
            "AVAILABLE",
            "CLEAN",
            "INSPECTED",
            "RESERVED"
        ].includes(r.room.status)) {
            if (!(override && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$domain$2f$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["can"])(actor.role, "checkout.override"))) throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$http$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AppError"](`Room ${r.room.number} is ${r.room.status}, not ready`);
        }
        const upd = await tx.reservation.updateMany({
            where: {
                id,
                version
            },
            data: {
                status: "CHECKED_IN",
                checkedInAt: new Date(),
                version: {
                    increment: 1
                }
            }
        });
        if (upd.count === 0) throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$http$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AppError"]("This reservation was changed by someone else. Reload and retry.");
        await tx.room.update({
            where: {
                id: r.room.id
            },
            data: {
                status: "OCCUPIED"
            }
        });
        const folio = await tx.folio.upsert({
            where: {
                reservationId: id
            },
            create: {
                reservationId: id
            },
            update: {}
        });
        const has = await tx.folioItem.count({
            where: {
                folioId: folio.id,
                category: "ROOM"
            }
        });
        if (!has) await tx.folioItem.create({
            data: {
                folioId: folio.id,
                category: "ROOM",
                description: `Room ${r.room.number} x ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$domain$2f$availability$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["nightsBetween"])(r.checkIn, r.checkOut)} nights`,
                qty: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$domain$2f$availability$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["nightsBetween"])(r.checkIn, r.checkOut),
                unitAmount: r.ratePerNight,
                businessDate: r.checkIn,
                postedById: actor.id
            }
        });
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$audit$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["audit"])(tx, actor.id, "checkin", "Reservation", id, `${actor.name} checked in ${r.code} to Room ${r.room.number}`);
        return {
            folioId: folio.id
        };
    });
}
async function getFolioTotals(folioId) {
    const f = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].folio.findUniqueOrThrow({
        where: {
            id: folioId
        },
        include: {
            items: true,
            payments: true
        }
    });
    const rules = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].feeRule.findMany();
    return {
        folio: f,
        totals: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$domain$2f$folio$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["computeFolio"])(f.items.map((i)=>({
                ...i,
                voided: !!i.voidedAt
            })), rules, f.payments)
    };
}
async function checkOut(id, override, actor) {
    const r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].reservation.findUniqueOrThrow({
        where: {
            id
        },
        include: {
            folio: true,
            room: true
        }
    });
    if (r.status !== "CHECKED_IN" || !r.folio || !r.room) throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$http$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AppError"]("Only checked-in guests can be checked out");
    const { totals } = await getFolioTotals(r.folio.id);
    if (totals.balance > 0 && !(override && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$domain$2f$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["can"])(actor.role, "checkout.override"))) throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$http$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AppError"](`Unpaid balance ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$domain$2f$folio$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["formatPHP"])(totals.balance)}. Settle payment first.`, 409, totals);
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].$transaction(async (tx)=>{
        await tx.reservation.update({
            where: {
                id
            },
            data: {
                status: "CHECKED_OUT",
                checkedOutAt: new Date(),
                checkedOutById: actor.id,
                version: {
                    increment: 1
                }
            }
        });
        await tx.folio.update({
            where: {
                id: r.folio.id
            },
            data: {
                closedAt: new Date(),
                closedById: actor.id
            }
        });
        await tx.room.update({
            where: {
                id: r.room.id
            },
            data: {
                status: "DIRTY"
            }
        });
        await tx.housekeepingTask.create({
            data: {
                roomId: r.room.id,
                status: "DIRTY"
            }
        });
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$audit$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["audit"])(tx, actor.id, "checkout", "Reservation", id, `${actor.name} checked out ${r.code}; balance ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$domain$2f$folio$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["formatPHP"])(totals.balance)}`, undefined, totals);
        return {
            totals
        };
    });
}
const paymentSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    amount: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive(),
    method: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
    reference: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    idempotencyKey: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(8),
    notes: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional()
});
async function recordPayment(folioId, raw, actor) {
    const d = paymentSchema.parse(raw);
    const dup = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].payment.findUnique({
        where: {
            idempotencyKey: d.idempotencyKey
        }
    });
    if (dup) return dup; // double-tap / retry returns the same payment
    const f = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].folio.findUniqueOrThrow({
        where: {
            id: folioId
        },
        include: {
            reservation: true
        }
    });
    if (f.closedAt) throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$http$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AppError"]("Folio is closed");
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].$transaction(async (tx)=>{
        const p = await tx.payment.create({
            data: {
                ...d,
                folioId,
                receivedById: actor.id
            }
        });
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$audit$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["audit"])(tx, actor.id, "payment.record", "Payment", p.id, `${actor.name} recorded ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$domain$2f$folio$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["formatPHP"])(d.amount)} ${d.method} for ${f.reservation.code}`);
        return p;
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__08_mzjs._.js.map