module.exports = [
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/src/app/(app)/rooms/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Reservations,
    "dynamic",
    ()=>dynamic
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-auth/index.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/server/db.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/server/auth.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$domain$2f$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/server/domain/permissions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$StatusBadge$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/StatusBadge.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$RoomForms$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/RoomForms.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$domain$2f$folio$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/server/domain/folio.ts [app-rsc] (ecmascript)");
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
const TABS = [
    [
        "All rooms",
        null
    ],
    [
        "Available",
        [
            "AVAILABLE",
            "CLEAN",
            "INSPECTED"
        ]
    ],
    [
        "Occupied",
        [
            "OCCUPIED"
        ]
    ],
    [
        "Needs cleaning",
        [
            "DIRTY",
            "CLEANING"
        ]
    ],
    [
        "Maintenance",
        [
            "MAINTENANCE",
            "OUT_OF_ORDER"
        ]
    ]
];
const th = "px-4 py-3 font-medium";
async function Reservations(props) {
    const searchParams = await props.searchParams;
    const user = (await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getServerSession"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authOptions"]))?.user;
    const canManage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$domain$2f$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["can"])(user.role, "room.manage");
    const tab = Number(searchParams.tab ?? 0);
    const st = TABS[tab]?.[1];
    const [rooms, typesRaw] = await Promise.all([
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].room.findMany({
            where: st ? {
                status: {
                    in: st
                }
            } : {},
            include: {
                roomType: true
            },
            orderBy: {
                number: "asc"
            }
        }),
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].roomType.findMany({
            orderBy: {
                baseRate: "asc"
            },
            include: {
                _count: {
                    select: {
                        rooms: true
                    }
                }
            }
        })
    ]);
    const types = typesRaw.map((t)=>({
            id: t.id,
            name: t.name,
            ratePesos: t.baseRate / 100,
            maxOccupancy: t.maxOccupancy,
            description: t.description ?? "",
            active: t.active
        }));
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-8",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "space-y-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "text-2xl font-semibold",
                                children: "Rooms"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(app)/rooms/page.tsx",
                                lineNumber: 27,
                                columnNumber: 58
                            }, this),
                            canManage && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$RoomForms$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["RoomButton"], {
                                types: types
                            }, void 0, false, {
                                fileName: "[project]/src/app/(app)/rooms/page.tsx",
                                lineNumber: 27,
                                columnNumber: 121
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(app)/rooms/page.tsx",
                        lineNumber: 27,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                        className: "flex gap-1 border-b border-slate-200",
                        "aria-label": "Filter",
                        children: TABS.map(([l], i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                                href: `/rooms?tab=${i}`,
                                className: `-mb-px border-b-2 px-4 py-2 text-sm ${i === tab ? "border-brand font-medium text-brand" : "border-transparent text-slate-500"}`,
                                children: l
                            }, l, false, {
                                fileName: "[project]/src/app/(app)/rooms/page.tsx",
                                lineNumber: 29,
                                columnNumber: 9
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/app/(app)/rooms/page.tsx",
                        lineNumber: 28,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                className: "w-full text-sm",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                        className: "bg-slate-50 text-left text-xs text-slate-500",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                            children: [
                                                [
                                                    "Room",
                                                    "Type",
                                                    "Floor",
                                                    "Max guests",
                                                    "Status",
                                                    "Rate per night"
                                                ].map((h)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        className: th,
                                                        children: h
                                                    }, h, false, {
                                                        fileName: "[project]/src/app/(app)/rooms/page.tsx",
                                                        lineNumber: 32,
                                                        columnNumber: 89
                                                    }, this)),
                                                canManage && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    className: th,
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "sr-only",
                                                        children: "Edit"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(app)/rooms/page.tsx",
                                                        lineNumber: 32,
                                                        columnNumber: 159
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(app)/rooms/page.tsx",
                                                    lineNumber: 32,
                                                    columnNumber: 140
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(app)/rooms/page.tsx",
                                            lineNumber: 31,
                                            columnNumber: 107
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(app)/rooms/page.tsx",
                                        lineNumber: 31,
                                        columnNumber: 43
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                        children: rooms.map((r)=>{
                                            const row = {
                                                id: r.id,
                                                number: r.number,
                                                roomTypeId: r.roomTypeId,
                                                floor: r.floor ?? "",
                                                maxOccupancy: r.maxOccupancy,
                                                amenities: r.amenities.join(", "),
                                                notes: r.notes ?? "",
                                                status: r.status
                                            };
                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                className: "border-t border-slate-100",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "px-4 py-3 font-medium",
                                                        children: r.number
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(app)/rooms/page.tsx",
                                                        lineNumber: 35,
                                                        columnNumber: 74
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "px-4",
                                                        children: r.roomType.name
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(app)/rooms/page.tsx",
                                                        lineNumber: 35,
                                                        columnNumber: 127
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "px-4",
                                                        children: r.floor ?? "-"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(app)/rooms/page.tsx",
                                                        lineNumber: 36,
                                                        columnNumber: 15
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "px-4",
                                                        children: r.maxOccupancy
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(app)/rooms/page.tsx",
                                                        lineNumber: 36,
                                                        columnNumber: 57
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "px-4",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$StatusBadge$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                                                            status: r.status
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(app)/rooms/page.tsx",
                                                            lineNumber: 36,
                                                            columnNumber: 120
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(app)/rooms/page.tsx",
                                                        lineNumber: 36,
                                                        columnNumber: 99
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "px-4",
                                                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$domain$2f$folio$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["formatPHP"])(r.roomType.baseRate)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(app)/rooms/page.tsx",
                                                        lineNumber: 37,
                                                        columnNumber: 15
                                                    }, this),
                                                    canManage && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "px-4 text-right",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$RoomForms$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["RoomButton"], {
                                                            room: row,
                                                            types: types
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(app)/rooms/page.tsx",
                                                            lineNumber: 37,
                                                            columnNumber: 119
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(app)/rooms/page.tsx",
                                                        lineNumber: 37,
                                                        columnNumber: 87
                                                    }, this)
                                                ]
                                            }, r.id, true, {
                                                fileName: "[project]/src/app/(app)/rooms/page.tsx",
                                                lineNumber: 35,
                                                columnNumber: 21
                                            }, this);
                                        })
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(app)/rooms/page.tsx",
                                        lineNumber: 33,
                                        columnNumber: 11
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(app)/rooms/page.tsx",
                                lineNumber: 31,
                                columnNumber: 9
                            }, this),
                            rooms.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "p-8 text-center text-sm text-slate-500",
                                children: "No rooms in this group."
                            }, void 0, false, {
                                fileName: "[project]/src/app/(app)/rooms/page.tsx",
                                lineNumber: 39,
                                columnNumber: 32
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(app)/rooms/page.tsx",
                        lineNumber: 30,
                        columnNumber: 7
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(app)/rooms/page.tsx",
                lineNumber: 26,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "space-y-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "text-xl font-semibold",
                                children: "Room types and rates"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(app)/rooms/page.tsx",
                                lineNumber: 43,
                                columnNumber: 58
                            }, this),
                            canManage && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$RoomForms$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["TypeButton"], {}, void 0, false, {
                                fileName: "[project]/src/app/(app)/rooms/page.tsx",
                                lineNumber: 43,
                                columnNumber: 135
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(app)/rooms/page.tsx",
                        lineNumber: 43,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                            className: "w-full text-sm",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                    className: "bg-slate-50 text-left text-xs text-slate-500",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                        children: [
                                            [
                                                "Type",
                                                "Rate per night",
                                                "Max guests",
                                                "Rooms",
                                                "Status"
                                            ].map((h)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    className: th,
                                                    children: h
                                                }, h, false, {
                                                    fileName: "[project]/src/app/(app)/rooms/page.tsx",
                                                    lineNumber: 46,
                                                    columnNumber: 81
                                                }, this)),
                                            canManage && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: th,
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "sr-only",
                                                    children: "Edit"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(app)/rooms/page.tsx",
                                                    lineNumber: 46,
                                                    columnNumber: 151
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(app)/rooms/page.tsx",
                                                lineNumber: 46,
                                                columnNumber: 132
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(app)/rooms/page.tsx",
                                        lineNumber: 45,
                                        columnNumber: 107
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(app)/rooms/page.tsx",
                                    lineNumber: 45,
                                    columnNumber: 43
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                    children: typesRaw.map((t, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                            className: "border-t border-slate-100",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "px-4 py-3 font-medium",
                                                    children: t.name
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(app)/rooms/page.tsx",
                                                    lineNumber: 47,
                                                    columnNumber: 96
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "px-4",
                                                    children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$domain$2f$folio$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["formatPHP"])(t.baseRate)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(app)/rooms/page.tsx",
                                                    lineNumber: 47,
                                                    columnNumber: 147
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "px-4",
                                                    children: t.maxOccupancy
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(app)/rooms/page.tsx",
                                                    lineNumber: 48,
                                                    columnNumber: 13
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "px-4",
                                                    children: t._count.rooms
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(app)/rooms/page.tsx",
                                                    lineNumber: 48,
                                                    columnNumber: 55
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "px-4",
                                                    children: t.active ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-emerald-700",
                                                        children: "Active"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(app)/rooms/page.tsx",
                                                        lineNumber: 49,
                                                        columnNumber: 46
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-slate-500",
                                                        children: "Inactive"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(app)/rooms/page.tsx",
                                                        lineNumber: 49,
                                                        columnNumber: 97
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(app)/rooms/page.tsx",
                                                    lineNumber: 49,
                                                    columnNumber: 13
                                                }, this),
                                                canManage && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "px-4 text-right",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$RoomForms$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["TypeButton"], {
                                                        type: types[i]
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(app)/rooms/page.tsx",
                                                        lineNumber: 50,
                                                        columnNumber: 59
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(app)/rooms/page.tsx",
                                                    lineNumber: 50,
                                                    columnNumber: 27
                                                }, this)
                                            ]
                                        }, t.id, true, {
                                            fileName: "[project]/src/app/(app)/rooms/page.tsx",
                                            lineNumber: 47,
                                            columnNumber: 43
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(app)/rooms/page.tsx",
                                    lineNumber: 47,
                                    columnNumber: 11
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(app)/rooms/page.tsx",
                            lineNumber: 45,
                            columnNumber: 9
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/(app)/rooms/page.tsx",
                        lineNumber: 44,
                        columnNumber: 7
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(app)/rooms/page.tsx",
                lineNumber: 42,
                columnNumber: 5
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(app)/rooms/page.tsx",
        lineNumber: 25,
        columnNumber: 11
    }, this);
}
}),
"[project]/src/app/(app)/rooms/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", (function(__turbopack_context__){

__turbopack_context__.n(__turbopack_context__.i("[project]/src/app/(app)/rooms/page.tsx [app-rsc] (ecmascript)"));
}),
"[project]/src/components/RoomForms.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RoomButton",
    ()=>RoomButton,
    "TypeButton",
    ()=>TypeButton
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const RoomButton = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call RoomButton() from the server but RoomButton is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/src/components/RoomForms.tsx", "RoomButton");
const TypeButton = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call TypeButton() from the server but TypeButton is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/src/components/RoomForms.tsx", "TypeButton");
}),
"[project]/src/components/RoomForms.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RoomButton",
    ()=>RoomButton,
    "TypeButton",
    ()=>TypeButton
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const RoomButton = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call RoomButton() from the server but RoomButton is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/src/components/RoomForms.tsx <module evaluation>", "RoomButton");
const TypeButton = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call TypeButton() from the server but TypeButton is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/src/components/RoomForms.tsx <module evaluation>", "TypeButton");
}),
"[project]/src/components/RoomForms.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$RoomForms$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/src/components/RoomForms.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$RoomForms$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/src/components/RoomForms.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$RoomForms$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
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
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0stqymz._.js.map