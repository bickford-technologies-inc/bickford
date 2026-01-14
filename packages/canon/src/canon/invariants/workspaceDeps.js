"use strict";
/**
 * Canon Invariant: Workspace Dependency Truth
 * TIMESTAMP: 2026-01-12T22:45:00-05:00
 *
 * A Canon package may not import a workspace module
 * that is not explicitly declared in its package.json.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertWorkspaceDeps = assertWorkspaceDeps;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function assertWorkspaceDeps(pkgDir, imports) {
    const pkgPath = path_1.default.join(pkgDir, "package.json");
    if (!fs_1.default.existsSync(pkgPath))
        return;
    const pkg = JSON.parse(fs_1.default.readFileSync(pkgPath, "utf8"));
    const declared = {
        ...pkg.dependencies,
        ...pkg.devDependencies,
    };
    for (const imp of imports) {
        if (imp.startsWith("@bickford/") && !declared?.[imp]) {
            throw new Error(`CANON INVARIANT VIOLATION: ${pkg.name} imports ${imp} without declaring it`);
        }
    }
}
