(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/components/FrontDeskActions.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AssignRoom",
    ()=>AssignRoom,
    "CheckInButton",
    ()=>CheckInButton
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/api.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
;
function CheckInButton({ id, version, label, canOverride }) {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const [err, setErr] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [busy, setBusy] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    async function go(override) {
        if (!window.confirm(`Check in ${label}?`)) return;
        setBusy(true);
        setErr("");
        const r = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["call"])(`/api/v1/reservations/${id}/check-in`, "POST", {
            version,
            override
        });
        setBusy(false);
        r.ok ? router.refresh() : setErr(r.error);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-1",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                disabled: busy,
                onClick: ()=>go(false),
                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["btn"],
                children: "Check in"
            }, void 0, false, {
                fileName: "[project]/src/components/FrontDeskActions.tsx",
                lineNumber: 13,
                columnNumber: 38
            }, this),
            err && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                role: "alert",
                className: "max-w-xs text-xs text-red-700",
                children: err
            }, void 0, false, {
                fileName: "[project]/src/components/FrontDeskActions.tsx",
                lineNumber: 14,
                columnNumber: 13
            }, this),
            err && canOverride && /not ready/.test(err) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: ()=>go(true),
                className: "text-xs text-brand underline",
                children: "Manager: check in anyway"
            }, void 0, false, {
                fileName: "[project]/src/components/FrontDeskActions.tsx",
                lineNumber: 15,
                columnNumber: 53
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/FrontDeskActions.tsx",
        lineNumber: 13,
        columnNumber: 11
    }, this);
}
_s(CheckInButton, "dw0TOGCPyD7vTMb/Wg9R8xF8YJw=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = CheckInButton;
function AssignRoom({ id, roomTypeId, from, to }) {
    _s1();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const [rooms, setRooms] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [err, setErr] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AssignRoom.useEffect": ()=>{
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["call"])(`/api/v1/availability?from=${from}&to=${to}&roomTypeId=${roomTypeId}`, "GET").then({
                "AssignRoom.useEffect": (r)=>r.ok && setRooms(r.data)
            }["AssignRoom.useEffect"]);
        }
    }["AssignRoom.useEffect"], [
        from,
        to,
        roomTypeId
    ]);
    async function pick(roomId) {
        if (!roomId) return;
        const r = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["call"])(`/api/v1/reservations/${id}/assign-room`, "POST", {
            roomId
        });
        r.ok ? router.refresh() : setErr(r.error);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                "aria-label": "Assign room",
                defaultValue: "",
                onChange: (e)=>pick(e.target.value),
                className: `${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["field"]} w-40`,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                        value: "",
                        children: "Assign room…"
                    }, void 0, false, {
                        fileName: "[project]/src/components/FrontDeskActions.tsx",
                        lineNumber: 23,
                        columnNumber: 5
                    }, this),
                    rooms.map((r)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                            value: r.id,
                            children: [
                                "Room ",
                                r.number
                            ]
                        }, r.id, true, {
                            fileName: "[project]/src/components/FrontDeskActions.tsx",
                            lineNumber: 23,
                            columnNumber: 59
                        }, this))
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/FrontDeskActions.tsx",
                lineNumber: 22,
                columnNumber: 16
            }, this),
            rooms.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-xs text-amber-700",
                children: "No room free"
            }, void 0, false, {
                fileName: "[project]/src/components/FrontDeskActions.tsx",
                lineNumber: 24,
                columnNumber: 28
            }, this),
            err && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                role: "alert",
                className: "text-xs text-red-700",
                children: err
            }, void 0, false, {
                fileName: "[project]/src/components/FrontDeskActions.tsx",
                lineNumber: 24,
                columnNumber: 91
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/FrontDeskActions.tsx",
        lineNumber: 22,
        columnNumber: 11
    }, this);
}
_s1(AssignRoom, "cQJAVJHDFQTd9qoWDTULW8j9AO8=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c1 = AssignRoom;
var _c, _c1;
__turbopack_context__.k.register(_c, "CheckInButton");
__turbopack_context__.k.register(_c1, "AssignRoom");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/api.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "btn",
    ()=>btn,
    "call",
    ()=>call,
    "field",
    ()=>field
]);
async function call(url, method, body) {
    try {
        const r = await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json"
            },
            body: body ? JSON.stringify(body) : undefined
        });
        const j = await r.json().catch(()=>({}));
        if (r.ok) return {
            ok: true,
            data: j
        };
        const fe = j.details?.fieldErrors;
        return {
            ok: false,
            error: fe ? Object.entries(fe).map(([k, v])=>`${k}: ${v[0]}`).join(". ") : j.error ?? "Could not save"
        };
    } catch  {
        return {
            ok: false,
            error: "No connection to the server. Nothing was saved."
        };
    }
}
const field = "w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none";
const btn = "inline-flex items-center rounded-md bg-brand px-3.5 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50";
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_components_164u_hl._.js.map