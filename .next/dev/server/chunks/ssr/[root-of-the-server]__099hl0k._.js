module.exports = [
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/src/app/(app)/reservations/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
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
        "All",
        null
    ],
    [
        "Upcoming",
        [
            "PENDING",
            "CONFIRMED"
        ]
    ],
    [
        "Checked in",
        [
            "CHECKED_IN"
        ]
    ],
    [
        "Checked out",
        [
            "CHECKED_OUT"
        ]
    ],
    [
        "Cancelled",
        [
            "CANCELLED",
            "NO_SHOW"
        ]
    ]
];
const d = (x)=>x.toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC"
    });
async function Reservations(props) {
    const searchParams = await props.searchParams;
    const user = (await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getServerSession"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["authOptions"]))?.user;
    const q = searchParams.q?.trim();
    const tab = Number(searchParams.tab ?? 0);
    const st = TABS[tab]?.[1];
    const rows = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].reservation.findMany({
        where: {
            ...st ? {
                status: {
                    in: st
                }
            } : {},
            ...q ? {
                OR: [
                    {
                        code: {
                            contains: q,
                            mode: "insensitive"
                        }
                    },
                    {
                        guest: {
                            fullName: {
                                contains: q,
                                mode: "insensitive"
                            }
                        }
                    },
                    {
                        guest: {
                            phone: {
                                contains: q
                            }
                        }
                    },
                    {
                        room: {
                            number: q
                        }
                    }
                ]
            } : {}
        },
        include: {
            guest: true,
            room: {
                include: {
                    roomType: true
                }
            }
        },
        orderBy: {
            checkIn: "desc"
        },
        take: 100
    });
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "text-2xl font-semibold",
                        children: "Reservations"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(app)/reservations/page.tsx",
                        lineNumber: 22,
                        columnNumber: 56
                    }, this),
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$domain$2f$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["can"])(user.role, "reservation.create") && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                        href: "/reservations/new",
                        className: "rounded-md bg-brand px-3.5 py-2 text-sm font-medium text-white",
                        children: "New reservation"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(app)/reservations/page.tsx",
                        lineNumber: 23,
                        columnNumber: 48
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(app)/reservations/page.tsx",
                lineNumber: 22,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                className: "flex gap-1 border-b border-slate-200",
                "aria-label": "Filter",
                children: TABS.map(([l], i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                        href: `/reservations?tab=${i}${q ? `&q=${encodeURIComponent(q)}` : ""}`,
                        className: `-mb-px border-b-2 px-4 py-2 text-sm ${i === tab ? "border-brand font-medium text-brand" : "border-transparent text-slate-500"}`,
                        children: l
                    }, l, false, {
                        fileName: "[project]/src/app/(app)/reservations/page.tsx",
                        lineNumber: 25,
                        columnNumber: 7
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/app/(app)/reservations/page.tsx",
                lineNumber: 24,
                columnNumber: 5
            }, this),
            q && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm text-slate-500",
                children: [
                    "Results for “",
                    q,
                    "”. ",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                        href: "/reservations",
                        className: "text-brand",
                        children: "Clear"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(app)/reservations/page.tsx",
                        lineNumber: 27,
                        columnNumber: 68
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(app)/reservations/page.tsx",
                lineNumber: 27,
                columnNumber: 11
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
                                        "Guest",
                                        "Code",
                                        "Room",
                                        "Check-in",
                                        "Check-out",
                                        "Status"
                                    ].map((h)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            className: "px-4 py-3 font-medium",
                                            children: h
                                        }, h, false, {
                                            fileName: "[project]/src/app/(app)/reservations/page.tsx",
                                            lineNumber: 30,
                                            columnNumber: 80
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(app)/reservations/page.tsx",
                                    lineNumber: 29,
                                    columnNumber: 105
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/(app)/reservations/page.tsx",
                                lineNumber: 29,
                                columnNumber: 41
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                children: rows.map((r)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                        className: "border-t border-slate-100",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                className: "px-4 py-3 font-medium",
                                                children: r.guest.fullName
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(app)/reservations/page.tsx",
                                                lineNumber: 31,
                                                columnNumber: 84
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                className: "px-4 text-slate-500",
                                                children: r.status === "CHECKED_IN" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                                                    href: `/front-desk/${r.id}`,
                                                    className: "text-brand",
                                                    children: r.code
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(app)/reservations/page.tsx",
                                                    lineNumber: 32,
                                                    columnNumber: 76
                                                }, this) : r.code
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(app)/reservations/page.tsx",
                                                lineNumber: 32,
                                                columnNumber: 11
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                className: "px-4",
                                                children: r.room ? `${r.room.roomType.name} ${r.room.number}` : "Unassigned"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(app)/reservations/page.tsx",
                                                lineNumber: 33,
                                                columnNumber: 11
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                className: "px-4",
                                                children: d(r.checkIn)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(app)/reservations/page.tsx",
                                                lineNumber: 34,
                                                columnNumber: 11
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                className: "px-4",
                                                children: d(r.checkOut)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(app)/reservations/page.tsx",
                                                lineNumber: 34,
                                                columnNumber: 51
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                className: "px-4",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$StatusBadge$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                                                    status: r.status
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(app)/reservations/page.tsx",
                                                    lineNumber: 34,
                                                    columnNumber: 113
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(app)/reservations/page.tsx",
                                                lineNumber: 34,
                                                columnNumber: 92
                                            }, this)
                                        ]
                                    }, r.id, true, {
                                        fileName: "[project]/src/app/(app)/reservations/page.tsx",
                                        lineNumber: 31,
                                        columnNumber: 31
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/app/(app)/reservations/page.tsx",
                                lineNumber: 31,
                                columnNumber: 9
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(app)/reservations/page.tsx",
                        lineNumber: 29,
                        columnNumber: 7
                    }, this),
                    rows.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "p-8 text-center text-sm text-slate-500",
                        children: "No reservations found."
                    }, void 0, false, {
                        fileName: "[project]/src/app/(app)/reservations/page.tsx",
                        lineNumber: 35,
                        columnNumber: 29
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(app)/reservations/page.tsx",
                lineNumber: 28,
                columnNumber: 5
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(app)/reservations/page.tsx",
        lineNumber: 21,
        columnNumber: 11
    }, this);
}
}),
"[project]/src/app/(app)/reservations/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", (function(__turbopack_context__){

__turbopack_context__.n(__turbopack_context__.i("[project]/src/app/(app)/reservations/page.tsx [app-rsc] (ecmascript)"));
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

//# sourceMappingURL=%5Broot-of-the-server%5D__099hl0k._.js.map