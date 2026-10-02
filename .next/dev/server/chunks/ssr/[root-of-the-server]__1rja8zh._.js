module.exports = [
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/src/app/(app)/housekeeping/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Housekeeping,
    "dynamic",
    ()=>dynamic
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-auth/index.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/server/db.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/server/auth.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$domain$2f$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/server/domain/permissions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$HousekeepingCard$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/HousekeepingCard.tsx [app-rsc] (ecmascript)");
;
;
;
;
;
;
const dynamic = "force-dynamic";
const COLUMNS = [
    [
        "To clean",
        "DIRTY",
        "No rooms waiting to be cleaned."
    ],
    [
        "Being cleaned",
        "CLEANING",
        "No rooms are being cleaned."
    ],
    [
        "Clean, awaiting inspection",
        "CLEAN",
        "Nothing finished today yet."
    ]
];
async function Housekeeping() {
    const user = (await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getServerSession"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authOptions"]))?.user;
    const canManage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$domain$2f$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["can"])(user.role, "housekeeping.manage");
    const mineOnly = user.role === "HOUSEKEEPING";
    // Midnight today in Manila (UTC+8), as a UTC instant.
    const since = new Date(new Date(new Date().toLocaleDateString("en-CA", {
        timeZone: "Asia/Manila"
    }) + "T00:00:00.000Z").getTime() - 8 * 3600e3);
    const where = {
        AND: [
            {
                OR: [
                    {
                        status: {
                            in: [
                                "DIRTY",
                                "CLEANING"
                            ]
                        }
                    },
                    {
                        status: "CLEAN",
                        completedAt: {
                            gte: since
                        }
                    }
                ]
            },
            ...mineOnly ? [
                {
                    OR: [
                        {
                            assignedToId: user.id
                        },
                        {
                            assignedToId: null
                        }
                    ]
                }
            ] : []
        ]
    };
    const [tasks, staff] = await Promise.all([
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].housekeepingTask.findMany({
            where,
            include: {
                room: {
                    include: {
                        roomType: true
                    }
                }
            },
            orderBy: {
                createdAt: "asc"
            }
        }),
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].user.findMany({
            where: {
                role: "HOUSEKEEPING",
                active: true
            },
            orderBy: {
                name: "asc"
            },
            select: {
                id: true,
                name: true
            }
        })
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-5",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "text-2xl font-semibold",
                        children: "Housekeeping"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(app)/housekeeping/page.tsx",
                        lineNumber: 31,
                        columnNumber: 10
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-slate-500",
                        children: [
                            mineOnly ? "Your rooms and unassigned rooms." : "All cleaning tasks.",
                            " Rooms become bookable when marked clean."
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(app)/housekeeping/page.tsx",
                        lineNumber: 32,
                        columnNumber: 7
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(app)/housekeeping/page.tsx",
                lineNumber: 31,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid gap-5 lg:grid-cols-3",
                children: COLUMNS.map(([title, status, empty])=>{
                    const list = tasks.filter((t)=>t.status === status);
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        "aria-label": title,
                        className: "space-y-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "flex items-center justify-between font-semibold",
                                children: [
                                    title,
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "rounded-full bg-slate-200 px-2 text-xs",
                                        children: list.length
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(app)/housekeeping/page.tsx",
                                        lineNumber: 37,
                                        columnNumber: 82
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(app)/housekeeping/page.tsx",
                                lineNumber: 37,
                                columnNumber: 11
                            }, this),
                            list.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500",
                                children: empty
                            }, void 0, false, {
                                fileName: "[project]/src/app/(app)/housekeeping/page.tsx",
                                lineNumber: 38,
                                columnNumber: 32
                            }, this) : list.map((t)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$HousekeepingCard$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                                    id: t.id,
                                    status: t.status,
                                    room: t.room.number,
                                    type: t.room.roomType.name,
                                    notes: t.notes ?? "",
                                    assignedToId: t.assignedToId ?? "",
                                    staff: staff,
                                    canManage: canManage
                                }, t.id, false, {
                                    fileName: "[project]/src/app/(app)/housekeeping/page.tsx",
                                    lineNumber: 39,
                                    columnNumber: 29
                                }, this))
                        ]
                    }, status, true, {
                        fileName: "[project]/src/app/(app)/housekeeping/page.tsx",
                        lineNumber: 36,
                        columnNumber: 17
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/src/app/(app)/housekeeping/page.tsx",
                lineNumber: 33,
                columnNumber: 5
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(app)/housekeeping/page.tsx",
        lineNumber: 30,
        columnNumber: 11
    }, this);
}
}),
"[project]/src/app/(app)/housekeeping/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", (function(__turbopack_context__){

__turbopack_context__.n(__turbopack_context__.i("[project]/src/app/(app)/housekeeping/page.tsx [app-rsc] (ecmascript)"));
}),
"[project]/src/components/HousekeepingCard.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call the default export of [project]/src/components/HousekeepingCard.tsx from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/src/components/HousekeepingCard.tsx", "default");
}),
"[project]/src/components/HousekeepingCard.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call the default export of [project]/src/components/HousekeepingCard.tsx <module evaluation> from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/src/components/HousekeepingCard.tsx <module evaluation>", "default");
}),
"[project]/src/components/HousekeepingCard.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$HousekeepingCard$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/src/components/HousekeepingCard.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$HousekeepingCard$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/src/components/HousekeepingCard.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$HousekeepingCard$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
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
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1rja8zh._.js.map